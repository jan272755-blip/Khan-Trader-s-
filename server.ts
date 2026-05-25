import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { User, Transaction, ActivityLog } from "./src/types";

// DB Models in memory and persisted in database.json
interface ServerDB {
  users: User[];
  transactions: Transaction[];
  logs: ActivityLog[];
}

const DB_PATH = path.join(process.cwd(), "database.json");

// Default seeding of DB
const initialDB: ServerDB = {
  users: [
    {
      username: "adminaccount",
      phone: "0000000000",
      password: "@admin@account@2727",
      balance: 0,
      referrals: 0,
      joinDate: new Date().toISOString(),
      isAdmin: true
    }
  ],
  transactions: [],
  logs: []
};

// Global DB variable
let db: ServerDB = { ...initialDB };

// Helper to loads DB from file
const loadDB = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const rawData = fs.readFileSync(DB_PATH, "utf-8");
      const loaded = JSON.parse(rawData);
      
      // Merge seeded admin account just in case it is missing
      const loadedUsers = loaded.users || [];
      if (!loadedUsers.some((u: User) => u.username.toLowerCase() === "adminaccount")) {
        loadedUsers.push(initialDB.users[0]);
      }
      
      db = {
        users: loadedUsers,
        transactions: loaded.transactions || [],
        logs: loaded.logs || []
      };
    } else {
      saveDB();
    }
  } catch (err) {
    console.error("Error loading server database.json:", err);
    saveDB();
  }
};

// Helper to save DB to file
const saveDB = () => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving server database.json:", err);
  }
};

// Load database immediately
loadDB();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing
  app.use(express.json({ limit: "50mb" }));

  // API Route - Get all data (Users, Transactions, Logs)
  app.get("/api/data", (req, res) => {
    res.json(db);
  });

  // API Route - Registration
  app.post("/api/register", (req, res) => {
    const newUser: User = req.body;
    if (!newUser || !newUser.username) {
      return res.status(400).json({ success: false, error: "Invalid registration payload" });
    }

    const exists = db.users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, error: "Username already exists" });
    }

    // Save referrer update in database
    if (newUser.referredBy) {
      const referrerIndex = db.users.findIndex(u => u.username.toLowerCase() === newUser.referredBy?.toLowerCase());
      if (referrerIndex !== -1) {
        db.users[referrerIndex].referrals = (db.users[referrerIndex].referrals || 0) + 1;
      }
    }

    db.users.push(newUser);
    saveDB();

    res.json({ success: true, user: newUser });
  });

  // API Route - Update user status / login touch
  app.post("/api/user-active", (req, res) => {
    const { username, lastSeen } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, error: "Missing username" });
    }

    const idx = db.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (idx !== -1) {
      if (lastSeen) {
        db.users[idx].lastSeen = lastSeen;
      }
      saveDB();
      return res.json({ success: true, user: db.users[idx] });
    }

    res.status(404).json({ success: false, error: "User not found" });
  });

  // API Route - Add general transaction
  app.post("/api/add-transaction", (req, res) => {
    const tx: Transaction = req.body;
    if (!tx || !tx.id) {
      return res.status(400).json({ success: false, error: "Invalid transaction" });
    }

    // Direct check if it already exists
    const duplicateIdx = db.transactions.findIndex(t => t.id === tx.id);
    if (duplicateIdx === -1) {
      db.transactions = [tx, ...db.transactions];
    } else {
      db.transactions[duplicateIdx] = tx;
    }
    saveDB();
    res.json({ success: true });
  });

  // API Route - Direct Update User Balance
  app.post("/api/update-user-balance", (req, res) => {
    const { username, amount } = req.body;
    if (!username || typeof amount !== "number") {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    const idx = db.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (idx !== -1) {
      db.users[idx].balance += amount;
      saveDB();
      return res.json({ success: true, user: db.users[idx] });
    }

    res.status(404).json({ success: false, error: "User not found" });
  });

  // API Route - Update User Password
  app.post("/api/update-password", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Missing password" });
    }

    const idx = db.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (idx !== -1) {
      db.users[idx].password = password;
      saveDB();
      return res.json({ success: true });
    }

    res.status(404).json({ success: false, error: "User not found" });
  });

  // API Route - Add action log
  app.post("/api/add-log", (req, res) => {
    const log: ActivityLog = req.body;
    if (!log || !log.id) {
      return res.status(400).json({ success: false, error: "Invalid log payload" });
    }

    db.logs = [log, ...db.logs];
    saveDB();
    res.json({ success: true });
  });

  // API Route - Admin Approve Transaction
  app.post("/api/approve-transaction", (req, res) => {
    const { txId } = req.body;
    if (!txId) {
      return res.status(400).json({ success: false, error: "Missing Transaction ID" });
    }

    const txIndex = db.transactions.findIndex(t => t.id === txId);
    if (txIndex === -1) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    const tx = db.transactions[txIndex];
    if (tx.status !== "pending") {
      return res.status(400).json({ success: false, error: "Transaction is already resolved" });
    }

    // Mark as success
    tx.status = "success";

    // Update user balance if it is deposit
    if (tx.type === "deposit") {
      const userIndex = db.users.findIndex(u => u.username.toLowerCase() === tx.username?.toLowerCase());
      if (userIndex !== -1) {
        db.users[userIndex].balance += tx.amount;
      }
    }

    saveDB();
    res.json({ success: true });
  });

  // API Route - Admin Reject Transaction
  app.post("/api/reject-transaction", (req, res) => {
    const { txId } = req.body;
    if (!txId) {
      return res.status(400).json({ success: false, error: "Missing Transaction ID" });
    }

    const txIndex = db.transactions.findIndex(t => t.id === txId);
    if (txIndex === -1) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    const tx = db.transactions[txIndex];
    if (tx.status !== "pending") {
      return res.status(400).json({ success: false, error: "Transaction is already resolved" });
    }

    // Mark as failed
    tx.status = "failed";

    // Since withdraw elements lock funds upon deposit, we refund the withdrawal amount back to user's balance
    if (tx.type === "withdraw") {
      const userIndex = db.users.findIndex(u => u.username.toLowerCase() === tx.username?.toLowerCase());
      if (userIndex !== -1) {
        db.users[userIndex].balance += Math.abs(tx.amount);
      }
    }

    saveDB();
    res.json({ success: true });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Web server initialized and listening on http://localhost:${PORT}`);
  });
}

startServer();
