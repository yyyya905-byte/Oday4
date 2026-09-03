import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, KeyRound, X, Delete } from 'lucide-react';

interface PinSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PinSwitchModal: React.FC<PinSwitchModalProps> = ({ isOpen, onClose }) => {
  const { users, loginWithPin, t, language } = useApp();
  const [pin, setPin] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // Auto-check 4-digit PIN
        setTimeout(() => {
          const success = loginWithPin(nextPin);
          if (success) {
            onClose();
          } else {
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('switchCashier')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          {/* Quick Staff Selection Chips */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            اختر الحساب أو أدخل الرمز السري (PIN):
          </p>

          <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => {
                  setSelectedUserId(u.id);
                  setPin('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  selectedUserId === u.id
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{u.name}</span>
                <span className="text-[9px] opacity-75">({u.role})</span>
              </button>
            ))}
          </div>

          {/* PIN Indicators Dots */}
          <div className="flex items-center justify-center gap-3 my-4">
            {[0, 1, 2, 3].map(index => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > index
                    ? 'bg-amber-500 border-amber-500 scale-110 shadow-xs shadow-amber-500/50'
                    : 'border-slate-300 dark:border-slate-600 bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mt-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                onClick={() => handleDigit(num)}
                className="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-xl font-bold text-slate-900 dark:text-white transition-all shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-600 dark:text-slate-400 transition-all"
            >
              C
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-xl font-bold text-slate-900 dark:text-white transition-all shadow-xs"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-all"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-4">
            رمز المدير الافتراضي: 1111 | الكاشير: 2222
          </p>
        </div>
      </div>
    </div>
  );
};
