'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { usePeriod, Period } from '@/components/PeriodProvider';
import { useAuth } from '@/components/AuthProvider';

export default function PeriodsPage() {
  const { periods, refreshPeriods } = usePeriod();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', semester: 'Ganjil' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setLoading(true);

    const { error } = await supabase.from('periods').insert([
      {
        name: formData.name,
        semester: formData.semester,
        is_active: periods.length === 0, // Make active if it's the first one
        user_id: user.id,
      },
    ]);

    if (!error) {
      setIsAdding(false);
      setFormData({ name: '', semester: 'Ganjil' });
      await refreshPeriods();
    } else {
      alert('Gagal menambahkan periode');
    }
    setLoading(false);
  };

  const handleSetActive = async (id: string) => {
    if (!supabase || !user) return;
    
    // Set all to inactive
    await supabase.from('periods').update({ is_active: false }).eq('user_id', user.id);
    
    // Set selected to active
    await supabase.from('periods').update({ is_active: true }).eq('id', id);
    
    await refreshPeriods();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (confirm('Yakin ingin menghapus periode ini? Semua data terkait akan terhapus.')) {
      await supabase.from('periods').delete().eq('id', id);
      await refreshPeriods();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Periode</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          {isAdding ? 'Batal' : 'Tambah Periode'}
        </button>
      </div>

      {isAdding && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Tahun Ajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2025/2026"
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Semester</label>
                <select
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-50"
            >
              Simpan
            </button>
          </form>
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tahun Ajaran</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Semester</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {periods.map((period) => (
              <tr key={period.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{period.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{period.semester}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {period.is_active ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      Tidak Aktif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!period.is_active && (
                    <button
                      onClick={() => handleSetActive(period.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Set Aktif
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(period.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {periods.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">
                  Belum ada data periode.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
