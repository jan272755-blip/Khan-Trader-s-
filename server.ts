import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { User, Transaction, ActivityLog } from "./src/types";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// DB Models in memory and persisted in database.json
interface ServerDB {
  users: User[];
  transactions: Transaction[];
  logs: ActivityLog[];
  settings?: {
    autoApprovalEnabled: boolean;
    autoApprovalDelayMinutes: number;
  };
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
  logs: [],
  settings: {
    autoApprovalEnabled: true,
    autoApprovalDelayMinutes: 30
  }
};

// Read Firebase config and initialize
let firebaseConfig: any = {};
let firebaseApp: any = null;
let firestoreDb: any = null;

try {
  const rawConfig = fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8");
  firebaseConfig = JSON.parse(rawConfig);
  firebaseApp = initializeApp(firebaseConfig);
  firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  console.log("Firebase initialized successfully on server.");
} catch (e) {
  console.error("Failed to initialize Firebase on server:", e);
}

// Global DB variable
let db: ServerDB = { ...initialDB };

// Helper to loads DB from file
const loadDB = async () => {
  try {
    // 1. Try to load from Cloud Firestore first
    if (firestoreDb) {
      try {
        console.log("Fetching database from Cloud Firestore...");
        const docRef = doc(firestoreDb, "appData", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const loaded = docSnap.data() as ServerDB;
          const loadedUsers = loaded.users || [];
          if (!loadedUsers.some((u: User) => u.username.toLowerCase() === "adminaccount")) {
            loadedUsers.push(initialDB.users[0]);
          }
          db = {
            users: loadedUsers,
            transactions: loaded.transactions || [],
            logs: loaded.logs || [],
            settings: loaded.settings || { autoApprovalEnabled: true, autoApprovalDelayMinutes: 30 }
          };
          console.log("Database successfully loaded from Cloud Firestore!");
          // Sync to local database.json file as cache
          fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
          return;
        } else {
          console.log("No data found in Cloud Firestore. Seeding default database...");
        }
      } catch (firestoreError) {
        console.error("Error loading from Cloud Firestore:", firestoreError);
      }
    }

    // 2. Fallback to local database.json
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
        logs: loaded.logs || [],
        settings: loaded.settings || { autoApprovalEnabled: true, autoApprovalDelayMinutes: 30 }
      };
      console.log("Database loaded from local database.json");
    } else {
      console.log("No database.json found. Creating initial data...");
      saveDB();
    }
  } catch (err) {
    console.error("Error loading server database:", err);
    saveDB();
  }
};

// Helper to save DB to file and Cloud Firestore (fire-and-forget background style)
const saveDB = () => {
  try {
    // Write locally first for high availability and low latency
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    
    // Backup to Cloud Firestore in background
    if (firestoreDb) {
      const docRef = doc(firestoreDb, "appData", "main");
      setDoc(docRef, db).catch(err => {
        console.error("Failed to save database backup to Cloud Firestore:", err);
      });
    }
  } catch (err) {
    console.error("Error saving server database:", err);
  }
};

// Auto approval engine that checks and approves deposit and withdrawal requests
const runAutoApproval = () => {
  try {
    const settings = db.settings || { autoApprovalEnabled: true, autoApprovalDelayMinutes: 30 };
    if (!settings.autoApprovalEnabled) {
      return;
    }

    let mutated = false;
    const now = new Date();
    const delayMs = settings.autoApprovalDelayMinutes * 60 * 1000;

    db.transactions.forEach((tx) => {
      if (tx.status === "pending") {
        const txDate = new Date(tx.date);
        if (isNaN(txDate.getTime())) return;

        const elapsedMs = now.getTime() - txDate.getTime();
        if (elapsedMs >= delayMs) {
          tx.status = "success";
          mutated = true;

          if (tx.type === "deposit") {
            const userIdx = db.users.findIndex(u => u.username.toLowerCase() === tx.username?.toLowerCase());
            if (userIdx !== -1) {
              db.users[userIdx].balance += tx.amount;
            }

            // Create system log
            const logId = `log_auto_approve_${tx.id}`;
            if (!db.logs.some(l => l.id === logId)) {
              db.logs.unshift({
                id: logId,
                username: tx.username || "system",
                action: "deposit_request",
                timestamp: now.toISOString(),
                details: `System Auto-Approved Deposit of Rs. ${tx.amount} (TID: ${tx.tid || "N/A"}) after ${settings.autoApprovalDelayMinutes} mins idle.`
              });
            }
          } else if (tx.type === "withdraw") {
            // Withdrawal request holds funds and reduces balance on presentation, so marking 'success' is sufficient
            // Create system log
            const logId = `log_auto_approve_${tx.id}`;
            if (!db.logs.some(l => l.id === logId)) {
              db.logs.unshift({
                id: logId,
                username: tx.username || "system",
                action: "withdraw_request",
                timestamp: now.toISOString(),
                details: `System Auto-Approved Withdrawal of Rs. ${Math.abs(tx.amount)} after ${settings.autoApprovalDelayMinutes} mins idle.`
              });
            }
          }
        }
      }
    });

    if (mutated) {
      saveDB();
    }
  } catch (err) {
    console.error("Error running auto-approval sweep:", err);
  }
};

// Start background interval for auto-approval every 15 seconds
setInterval(runAutoApproval, 15000);

// Load database and run auto-approval scan will be done asynchronously when startServer() boots up

async function startServer() {
  // Load database from cloud firestore asynchronously on boot before listening
  await loadDB();
  runAutoApproval();

  const app = express();
  const PORT = 3000;

  // JSON Body parsing
  app.use(express.json({ limit: "50mb" }));

  // API Route - Get all data (Users, Transactions, Logs)
  app.get("/api/data", (req, res) => {
    runAutoApproval();
    res.json(db);
  });

  // API Route - Two-way Sync and Merge
  app.post("/api/sync", (req, res) => {
    const clientData = req.body;
    let mutated = false;

    if (clientData) {
      // 1. Merge Users
      if (Array.isArray(clientData.users)) {
        clientData.users.forEach((clientUser: User) => {
          if (!clientUser || !clientUser.username) return;
          const serverUserIdx = db.users.findIndex(u => u.username.toLowerCase() === clientUser.username.toLowerCase());
          if (serverUserIdx === -1) {
            // User from client local storage doesn't exist on server; add it
            db.users.push(clientUser);
            mutated = true;
          } else {
            // User exists on server; update client modifications if any (like password/phone if they are empty on server, or latest lastSeen)
            const serverUser = db.users[serverUserIdx];
            let userChanged = false;
            
            if (!serverUser.password && clientUser.password) {
              serverUser.password = clientUser.password;
              userChanged = true;
            }
            if (!serverUser.phone && clientUser.phone) {
              serverUser.phone = clientUser.phone;
              userChanged = true;
            }
            if (clientUser.referredBy && !serverUser.referredBy) {
              serverUser.referredBy = clientUser.referredBy;
              userChanged = true;
            }
            if (clientUser.lastSeen && (!serverUser.lastSeen || new Date(clientUser.lastSeen).getTime() > new Date(serverUser.lastSeen).getTime())) {
              serverUser.lastSeen = clientUser.lastSeen;
              userChanged = true;
            }
            
            if (userChanged) {
              mutated = true;
            }
          }
        });
      }

      // 2. Merge Transactions
      if (Array.isArray(clientData.transactions)) {
        clientData.transactions.forEach((clientTx: Transaction) => {
          if (!clientTx || !clientTx.id) return;
          const serverTxIdx = db.transactions.findIndex(t => t.id === clientTx.id);
          if (serverTxIdx === -1) {
            // Client transaction is new; add to server database
            db.transactions.push(clientTx);
            mutated = true;
          } else {
            // Keep the more resolved status from server, but if client has resolved it, let's keep success/failed
            const serverTx = db.transactions[serverTxIdx];
            if (serverTx.status === 'pending' && clientTx.status !== 'pending') {
              serverTx.status = clientTx.status;
              mutated = true;
            }
          }
        });
        
        // Sort transactions descending by date
        db.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      // 3. Merge logs
      if (Array.isArray(clientData.logs)) {
        clientData.logs.forEach((clientLog: ActivityLog) => {
          if (!clientLog || !clientLog.id) return;
          const serverLogIdx = db.logs.findIndex(l => l.id === clientLog.id);
          if (serverLogIdx === -1) {
            // New log; add it
            db.logs.push(clientLog);
            mutated = true;
          }
        });
        
        // Sort logs descending by timestamp
        db.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    }

    if (mutated) {
      saveDB();
    }

    runAutoApproval();
    res.json(db);
  });

  // API Route - Get Auto-Approval Settings
  app.get("/api/settings", (req, res) => {
    res.json(db.settings || { autoApprovalEnabled: true, autoApprovalDelayMinutes: 30 });
  });

  // API Route - Update Auto-Approval Settings
  app.post("/api/settings", (req, res) => {
    const { autoApprovalEnabled, autoApprovalDelayMinutes } = req.body;
    db.settings = {
      autoApprovalEnabled: typeof autoApprovalEnabled === "boolean" ? autoApprovalEnabled : true,
      autoApprovalDelayMinutes: typeof autoApprovalDelayMinutes === "number" ? autoApprovalDelayMinutes : 30
    };
    saveDB();
    
    // Immediately run auto approvals if enabled
    if (db.settings.autoApprovalEnabled) {
      runAutoApproval();
    }
    
    // Add system log for setting change
    db.logs.unshift({
      id: "log_settings_change_" + Date.now(),
      username: "adminaccount",
      action: "deposit_request",
      timestamp: new Date().toISOString(),
      details: `Admin changed auto-approval configuration: Enabled=${db.settings.autoApprovalEnabled}, Timeout=${db.settings.autoApprovalDelayMinutes} mins.`
    });
    saveDB();

    res.json({ success: true, settings: db.settings });
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

  // API Route - Login Verification
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, error: "Username not found. Please register first." });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, error: "Invalid password. Please try again." });
    }

    res.json({ success: true, user });
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
