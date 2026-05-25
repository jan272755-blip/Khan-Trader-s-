import { User, Transaction, ActivityLog } from '../types';

const USER_KEY = 'khan_trader_user';
const USERS_DB_KEY = 'khan_traders_db';
const TRANSACTIONS_KEY = 'khan_trader_transactions';

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed && parsed.username && parsed.username.toLowerCase() === 'adminaccount') {
      parsed.isAdmin = true;
    }
    return parsed;
  },
  setUser: (user: User) => {
    if (user && user.username && user.username.toLowerCase() === 'adminaccount') {
      user.isAdmin = true;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUsersDB: (): User[] => {
    const data = localStorage.getItem(USERS_DB_KEY);
    const list = data ? JSON.parse(data) : [];
    return list.map((u: User) => {
      if (u && u.username && u.username.toLowerCase() === 'adminaccount') {
        u.isAdmin = true;
      }
      return u;
    });
  },
  registerUser: (user: User): boolean => {
    const db = storage.getUsersDB();
    if (db.some(u => u.username.toLowerCase() === user.username.toLowerCase())) {
      return false; // Already exists
    }
    
    // If user is referred, increment referrer's referrals count in user database
    if (user.referredBy) {
      const referrerIndex = db.findIndex(u => u.username.toLowerCase() === user.referredBy?.toLowerCase());
      if (referrerIndex !== -1) {
        db[referrerIndex].referrals = (db[referrerIndex].referrals || 0) + 1;
      }
    }
    
    localStorage.setItem(USERS_DB_KEY, JSON.stringify([...db, user]));
    // Clear the stored temporary referral param
    localStorage.removeItem('khan_traders_referred_by');

    // Sync to backend Server asynchronously
    fetch('/api/register', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    }).catch(err => console.error("Failed to sync register to server:", err));

    return true;
  },
  findUser: (username: string): User | undefined => {
    const db = storage.getUsersDB();
    return db.find(u => u.username.toLowerCase() === username.toLowerCase());
  },
  logout: () => {
    localStorage.removeItem(USER_KEY);
  },
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },
  addTransaction: (tx: Transaction) => {
    const transactions = storage.getTransactions();
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([tx, ...transactions]));

    // Sync to backend Server asynchronously
    fetch('/api/add-transaction', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx)
    }).catch(err => console.error("Failed to sync transaction to server:", err));
  },
  updateBalance: (amount: number) => {
    const user = storage.getUser();
    if (user) {
      user.balance += amount;
      storage.setUser(user);
      
      // Also update in DB
      const db = storage.getUsersDB();
      const updatedDb = db.map(u => u.username.toLowerCase() === user.username.toLowerCase() ? user : u);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedDb));

      // Sync to backend Server asynchronously
      fetch('/api/update-user-balance', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, amount })
      }).catch(err => console.error("Failed to sync user balance to server:", err));
    }
  },
  updatePassword: (username: string, newPassword: string): boolean => {
    const db = storage.getUsersDB();
    const userIndex = db.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex === -1) {
      return false;
    }
    db[userIndex].password = newPassword;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    
    // Also update current active user if logged in with that username
    const currentUser = storage.getUser();
    if (currentUser && currentUser.username.toLowerCase() === username.toLowerCase()) {
      currentUser.password = newPassword;
      storage.setUser(currentUser);
    }

    // Sync to backend Server asynchronously
    fetch('/api/update-password', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: newPassword })
    }).catch(err => console.error("Failed to sync password change to server:", err));

    return true;
  },
  getLogs: (): ActivityLog[] => {
    const data = localStorage.getItem('khan_trader_activity_logs');
    return data ? JSON.parse(data) : [];
  },
  addLog: (action: 'login' | 'logout' | 'deposit_request' | 'withdraw_request' | 'plan_investment', username: string, details?: string) => {
    const logs = storage.getLogs();
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    localStorage.setItem('khan_trader_activity_logs', JSON.stringify([newLog, ...logs]));

    // Sync to backend Server asynchronously
    fetch('/api/add-log', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLog)
    }).catch(err => console.error("Failed to sync activity log to server:", err));
  },

  // Approve a pending deposit or withdrawal request
  approveTransactionServer: async (txId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/approve-transaction', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txId })
      });
      return res.ok;
    } catch (err) {
      console.error("Failed to approve transaction on backend server:", err);
      return false;
    }
  },

  // Reject a pending deposit or withdrawal request
  rejectTransactionServer: async (txId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/reject-transaction', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txId })
      });
      return res.ok;
    } catch (err) {
      console.error("Failed to reject transaction on backend server:", err);
      return false;
    }
  },

  // Update another user's balance on backend server (for referral commission)
  updateOtherUserBalanceServer: async (username: string, amount: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/update-user-balance', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, amount })
      });
      return res.ok;
    } catch (err) {
      console.error("Failed to update other user balance on server:", err);
      return false;
    }
  },

  // Background sync function called during client-polling
  syncWithServer: async (): Promise<boolean> => {
    try {
      // Periodic ping to keep user active and track lastSeen in server DB
      const currentUser = storage.getUser();
      if (currentUser) {
        fetch('/api/user-active', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            username: currentUser.username, 
            lastSeen: new Date().toISOString() 
          })
        }).catch(() => {});
      }

      // Collect local database inputs to merge with server
      const localUsers = storage.getUsersDB();
      const localTransactions = storage.getTransactions();
      const localLogs = storage.getLogs();

      const res = await fetch('/api/sync', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: localUsers,
          transactions: localTransactions,
          logs: localLogs
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.users) localStorage.setItem(USERS_DB_KEY, JSON.stringify(data.users));
        if (data.transactions) localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data.transactions));
        if (data.logs) localStorage.setItem('khan_trader_activity_logs', JSON.stringify(data.logs));
        
        // Match the current active user with freshly synced database instance (balance updates, etc.)
        if (currentUser) {
          const freshUser = data.users.find((u: User) => u.username.toLowerCase() === currentUser.username.toLowerCase());
          if (freshUser) {
            storage.setUser(freshUser);
          }
        }
        return true;
      }
    } catch (err) {
      console.error("Failed to sync client with database server:", err);
    }
    return false;
  }
};
