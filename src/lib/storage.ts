import { User, Transaction, ActivityLog } from '../types';

const USER_KEY = 'khan_trader_user';
const USERS_DB_KEY = 'khan_traders_db';
const TRANSACTIONS_KEY = 'khan_trader_transactions';

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUsersDB: (): User[] => {
    const data = localStorage.getItem(USERS_DB_KEY);
    return data ? JSON.parse(data) : [];
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
    return true;
  },
  findUser: (username: string): User | undefined => {
    const db = storage.getUsersDB();
    return db.find(u => u.username === username);
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
  },
  updateBalance: (amount: number) => {
    const user = storage.getUser();
    if (user) {
      user.balance += amount;
      storage.setUser(user);
      
      // Also update in DB
      const db = storage.getUsersDB();
      const updatedDb = db.map(u => u.username === user.username ? user : u);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedDb));
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
  }
};
