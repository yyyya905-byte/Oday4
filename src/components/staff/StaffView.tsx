import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  UserCog,
  Plus,
  Shield,
  KeyRound,
  Trash2,
  Edit2,
  FileSpreadsheet,
  History,
  X,
  Lock,
  Sparkles
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const {
    users,
    auditLogs,
    addUser,
    updateUser,
    deleteUser,
    currentUser,
    t,
    language,
    notify
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [pinCode, setPinCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setRole('cashier');
    setPinCode('1234');
    setEmail('');
    setPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setRole(u.role);
    setPinCode(u.pinCode);
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pinCode.trim()) {
      notify('تنبيه', 'يرجى إدخال اسم الموظف ورمز الدخول PIN', 'warning');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        role,
        pinCode,
        email,
        phone,
      });
      notify('تم بنجاح', `تم تحديث بيانات ${name}`, 'success');
    } else {
      addUser({
        name,
        role,
        pinCode,
        email,
        phone,
      });
      notify('تم بنجاح', `تم إضافة الموظف الجديد ${name}`, 'success');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('staffManagementTitle')}</span>
            <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
              الصلاحيات والأمان
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            إدارة الكاشيرات والمدراء، تعيين رموز PIN للدخول السريع، ومراقبة سجل العمليات الحساسة
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addStaff')}</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => {
          const isMe = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs transition-all relative ${
                isMe ? 'border-amber-500/50 ring-2 ring-amber-500/20' : 'border-slate-200/90 dark:border-slate-800'
              }`}
            >
              {isMe && (
                <span className="absolute top-4 end-4 text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                  حسابك الحالي
                </span>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{u.name}</h3>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {u.role === 'admin' ? 'مدير النظام (Admin)' : u.role === 'manager' ? 'مدير فرع (Manager)' : u.role === 'cashier' ? 'كاشير (Cashier)' : u.role}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 py-2 border-t border-b border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>رمز الدخول (PIN):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">•••• ({u.pinCode})</span>
                </div>
                {u.phone && (
                  <div className="flex justify-between">
                    <span>الهاتف:</span>
                    <span className="font-mono">{u.phone}</span>
                  </div>
                )}
                {u.email && (
                  <div className="flex justify-between">
                    <span>البريد:</span>
                    <span className="font-mono">{u.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-1 flex justify-end gap-1.5">
                <button
                  onClick={() => openEditModal(u)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  تعديل
                </button>
                {!isMe && (
                  <button
                    onClick={() => {
                      if (confirm(`حذف الموظف (${u.name})؟`)) {
                        deleteUser(u.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Audit Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500" />
          <span>سجل الرقابة والأمان (Audit Log)</span>
        </h3>
        <p className="text-xs text-slate-400">
          تسجيل العمليات الحساسة (المرتجعات، تعديل الأسعار، تغيير المخزون، حذف السجلات) مع اسم المستخدم والطابع الزمني
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="pb-2 text-start">المستخدم</th>
                <th className="pb-2 text-start">نوع الإجراء</th>
                <th className="pb-2 text-start">التفاصيل</th>
                <th className="pb-2 text-end">التاريخ والوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.slice(0, 10).map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {log.userName}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">
                    {log.details}
                  </td>
                  <td className="py-3 text-end font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-SY' : 'en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingUser ? 'تعديل حساب موظف' : 'إضافة موظف جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الموظف *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: يزن الحمد"
                  className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الدور والصلاحية
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="cashier">كاشير (POS Sales Only)</option>
                  <option value="manager">مدير فرع (Manager)</option>
                  <option value="admin">مدير النظام بكامل الصلاحيات (Admin)</option>
                  <option value="inventory">أمين مستودع (Inventory)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رمز الدخول السريع (PIN 4 أرقام) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value)}
                  placeholder="1234"
                  className="w-full text-center text-lg font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="09..."
                  className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  حفظ الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
