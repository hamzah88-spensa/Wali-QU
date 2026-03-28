'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePeriod } from '@/components/PeriodProvider';
import { useAuth } from '@/components/AuthProvider';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function CommunicationsPage() {
  const { activePeriod } = usePeriod();
  const { user } = useAuth();
  const [communications, setCommunications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: '', 
    student_id: '', 
    date: format(new Date(), 'yyyy-MM-dd'), 
    type: 'Orang Tua', 
    notes: '' 
  });
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    if (!supabase || !activePeriod) return;
    setLoading(true);
    
    const { data: studentsData } = await supabase
      .from('students')
      .select('id, name, class')
      .eq('period_id', activePeriod.id)
      .order('name');
      
    if (studentsData) setStudents(studentsData);

    const { data: commsData } = await supabase
      .from('communications')
      .select('*, students!inner(name, class, period_id)')
      .eq('students.period_id', activePeriod.id)
      .order('date', { ascending: false });
      
    if (commsData) setCommunications(commsData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activePeriod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    const payload = {
      student_id: formData.student_id,
      date: formData.date,
      type: formData.type,
      notes: formData.notes,
      user_id: user.id,
    };

    if (formData.id) {
      await supabase.from('communications').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('communications').insert([payload]);
    }

    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (confirm('Yakin ingin menghapus catatan ini?')) {
      await supabase.from('communications').delete().eq('id', id);
      fetchData();
    }
  };

  const filteredComms = communications.filter(comm => 
    comm.students.name.toLowerCase().includes(search.toLowerCase()) ||
    comm.type.toLowerCase().includes(search.toLowerCase())
  );

  if (!activePeriod) {
    return <div className="text-center mt-10 text-slate-500">Pilih periode aktif terlebih dahulu.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Catatan Komunikasi</h1>
        <button
          onClick={() => {
            setFormData({ 
              id: '', 
              student_id: students.length > 0 ? students[0].id : '', 
              date: format(new Date(), 'yyyy-MM-dd'), 
              type: 'Orang Tua', 
              notes: '' 
            });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Catatan
        </button>
      </div>

      <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama siswa atau pihak terkait..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Siswa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pihak Terkait</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Catatan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td></tr>
              ) : filteredComms.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Tidak ada catatan komunikasi.</td></tr>
              ) : (
                filteredComms.map((comm) => (
                  <tr key={comm.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{format(new Date(comm.date), 'dd MMM yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{comm.students.name} <span className="text-slate-500 font-normal">({comm.students.class})</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {comm.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{comm.notes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setFormData(comm);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(comm.id)}
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">{formData.id ? 'Edit Catatan' : 'Tambah Catatan'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Siswa</label>
                <select
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                >
                  <option value="" disabled>Pilih Siswa</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.class}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tanggal</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Pihak Terkait</label>
                  <select
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Guru BK">Guru BK</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Catatan / Hasil Komunikasi</label>
                <textarea
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={4}
                  value={formData.notes}
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
