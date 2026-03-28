'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePeriod } from '@/components/PeriodProvider';
import { useAuth } from '@/components/AuthProvider';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function StudentsPage() {
  const { activePeriod } = usePeriod();
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', nis: '', class: '', gender: 'Laki-laki', notes: '' });
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    if (!supabase || !activePeriod) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('period_id', activePeriod.id)
      .order('name', { ascending: true });
    
    if (!error && data) {
      setStudents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [activePeriod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !activePeriod || !user) return;

    const payload = {
      name: formData.name,
      nis: formData.nis,
      class: formData.class,
      gender: formData.gender,
      notes: formData.notes,
      period_id: activePeriod.id,
      user_id: user.id,
    };

    if (formData.id) {
      await supabase.from('students').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('students').insert([payload]);
    }

    setIsModalOpen(false);
    setFormData({ id: '', name: '', nis: '', class: '', gender: 'Laki-laki', notes: '' });
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      await supabase.from('students').delete().eq('id', id);
      fetchStudents();
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  if (!activePeriod) {
    return <div className="text-center mt-10 text-slate-500">Pilih periode aktif terlebih dahulu.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Data Siswa</h1>
        <button
          onClick={() => {
            setFormData({ id: '', name: '', nis: '', class: '', gender: 'Laki-laki', notes: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Siswa
        </button>
      </div>

      <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama, NIS, atau kelas..."
          className="ml-2 flex-1 border-0 bg-transparent focus:outline-none focus:ring-0 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">L/P</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Tidak ada data siswa.</td></tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.nis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.class}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.gender === 'Laki-laki' ? 'L' : 'P'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setFormData(student);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-[95vw] sm:w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{formData.id ? 'Edit Siswa' : 'Tambah Siswa'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">NIS</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Kelas</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Jenis Kelamin</label>
                  <select
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Catatan Tambahan</label>
                <textarea
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
