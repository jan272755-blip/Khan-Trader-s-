import { motion } from 'motion/react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Notification({ message, type, onClose }: NotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 20, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className="fixed top-0 left-1/2 z-[100] w-[90%] max-w-md"
    >
      <div className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 border backdrop-blur-xl ${
        type === 'success' 
          ? 'bg-white/5 border-yellow-500/20 text-yellow-500' 
          : 'bg-white/5 border-red-500/20 text-red-500'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-yellow-500 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        )}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="w-4 h-4 opacity-50" />
        </button>
      </div>
    </motion.div>
  );
}
