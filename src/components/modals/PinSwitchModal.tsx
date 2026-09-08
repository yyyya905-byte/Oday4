import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, KeyRound, X, Delete, ShieldCheck, Zap, UserCheck } from 'lucide-react';
import { getRoleInfo } from '../../utils/permissions';

interface PinSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PinSwitchModal: React.FC<PinSwitchModalProps> = ({ isOpen, onClose }) => {
  const { users, loginWithPin, t, language, currentUser } = useApp();
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

  const handleQuickLogin = (userPin: string) => {
    const success = loginWithPin(userPin);
    if (success) {
      onClose();
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                تبديل المستخدم ومستوى الصلاحية
              </h3>
              <p className="text-[11px] text-slate-400">
                تسجيل الدخول السريع لاختبار مستويات الوصول (كاشير، مشرف، مدير)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 text-center">
          {/* Quick Staff Selection Cards */}
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 text-start">
              الحسابات ومستويات الوصول المتاحة:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map(u => {
                const roleMeta = getRoleInfo(u.role);
                const isCurrent = currentUser.id === u.id;

                return (
                  <div
                    key={u.id}
                    className={`p-2.5 rounded-2xl border text-start flex items-center justify-between gap-2 transition-all ${
                      isCurrent
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-amber-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-slate-900 dark:text-white truncate">
                          {u.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1 rounded">
                            النشط
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${roleMeta.badgeColor}`}>
                          {roleMeta.badgeLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          PIN: {u.pinCode}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickLogin(u.pinCode)}
                      className="px-2 py-1 rounded-xl text-[10px] font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shrink-0 cursor-pointer shadow-2xs"
                      title={`دخول فوري بحساب ${u.name}`}
                    >
                      دخول
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative my-3 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase shrink-0">
              أو كتابة الرمز السري (PIN)
            </span>
          </div>

          {/* PIN Indicators Dots */}
          <div className="flex items-center justify-center gap-3 my-3">
            {[0, 1, 2, 3].map(index => (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  pin.length > index
                    ? 'bg-amber-500 border-amber-500 scale-110 shadow-xs shadow-amber-500/50'
                    : 'border-slate-300 dark:border-slate-600 bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mt-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                onClick={() => handleDigit(num)}
                className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-lg font-bold text-slate-900 dark:text-white transition-all shadow-xs cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
            >
              C
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-lg font-bold text-slate-900 dark:text-white transition-all shadow-xs cursor-pointer"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
