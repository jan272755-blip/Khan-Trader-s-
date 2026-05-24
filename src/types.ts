
export interface User {
  username: string;
  phone: string;
  password?: string;
  balance: number;
  referrals: number;
  joinDate: string;
  lastSeen?: string;
  isAdmin?: boolean;
  referredBy?: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  price: number;
  dailyProfit: number;
  duration: number; // in days
  level: string; // Basic, Silver, Gold, VIP
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'investment' | 'earning';
  amount: number;
  date: string;
  status: 'pending' | 'success' | 'failed';
  investmentId?: string;
  username?: string;
  phone?: string;
  details?: string;
  tid?: string;
  receiptImage?: string;
  accountType?: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
}

export interface ActivityLog {
  id: string;
  username: string;
  action: 'login' | 'logout' | 'deposit_request' | 'withdraw_request' | 'plan_investment';
  timestamp: string;
  details?: string;
}
