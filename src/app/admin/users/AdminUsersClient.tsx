'use client';

import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, UserPlus, Edit3, Trash2, CheckCircle2, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  createdAt: string;
  _count?: { pets: number };
}

interface AdminUsersClientProps {
  initialUsers: AdminUserItem[];
}

export const AdminUsersClient: React.FC<AdminUsersClientProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) setUsers(data.users);
      }
    } catch (e) {
      console.error('Fetch admin users error:', e);
    }
  };

  useEffect(() => {
    fetchUsers();

    const handleUpdate = () => fetchUsers();
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('puppy_id_pets_updated', handleUpdate);
    return () => {
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('puppy_id_pets_updated', handleUpdate);
    };
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, role }),
      });

      if (res.ok) {
        setNotice(`✅ Account created for ${name} (${role})!`);
        setTimeout(() => setNotice(null), 3500);
        setIsAddModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
        setRole('USER');
        fetchUsers();
        window.dispatchEvent(new Event('puppy_id_pets_updated'));
      }
    } catch (err) {
      console.error('Create user failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role,
        }),
      });

      if (res.ok) {
        setNotice(`✅ Account updated for ${editingUser.name}!`);
        setTimeout(() => setNotice(null), 3500);
        setEditingUser(null);
        fetchUsers();
        window.dispatchEvent(new Event('puppy_id_pets_updated'));
      }
    } catch (err) {
      console.error('Update user failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (u: AdminUserItem) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete user account "${u.name}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotice(`✅ Account for ${u.name} removed.`);
        setTimeout(() => setNotice(null), 3500);
        fetchUsers();
        window.dispatchEvent(new Event('puppy_id_pets_updated'));
      }
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const staffCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="space-y-6 max-w-6xl animate-fadeIn text-slate-100">
      {/* Header & Stat Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-coral" />
            <span>User & Support Staff Management</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Manage pet owners, support staff personnel, permissions, and roles
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-brand-coral hover:bg-brand-coral/90 text-white font-black text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member / User</span>
        </button>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
            <div className="text-2xl font-black text-white mt-1">{users.length}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Support Staff / Admins</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{staffCount}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pet Owners</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{users.length - staffCount}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email & Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Pets</th>
                <th className="py-3 px-4 text-right">Actions / Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/80 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">{u.name}</td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-200">{u.email}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{u.phone || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role === 'ADMIN' ? '🛡️ ADMIN / STAFF' : '🐶 USER'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-amber-400">{u._count?.pets || 0} Pet(s)</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-slate-500 text-[11px] mr-2">{formatDate(u.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => setEditingUser(u)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit User Role"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER / STAFF MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-coral" />
                <span>Add User or Support Staff</span>
              </h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rahul Verma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@clinic.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 96526 36993"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Account Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
                >
                  <option value="USER">🐶 USER (Pet Owner)</option>
                  <option value="ADMIN">🛡️ ADMIN / STAFF (Support Personnel)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-brand-coral hover:bg-brand-coral/90 text-white font-black text-xs rounded-xl shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Edit User Account / Role</span>
              </h3>
              <button type="button" onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Account Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white"
                >
                  <option value="USER">🐶 USER (Pet Owner)</option>
                  <option value="ADMIN">🛡️ ADMIN / STAFF (Support Personnel)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
