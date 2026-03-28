'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePeriod } from '@/components/PeriodProvider';
import { useAuth } from '@/components/AuthProvider';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function MentoringPage() {
  const { activePeriod } = usePeriod();
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: '', 
    student_id: '', 
    date: format(new Date(), 'yyyy-MM-dd'), 
    category: 'Akademik', 
    description: '', 
    follow_up: '', 
    status: 'Baik' 
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    if (!supabase || !activePeriod) return;
    setLoading(true);
    
    // Fetch students for dropdown
    const { data: studentsData } = await supabase
      .from('students')
      .select('id, name, class')
      .eq('period_id', activePeriod.id)
      .order('name');
      
    if (studentsData) setStudents(studentsData);

    // Fetch logs
    const { data: logsData } = await supabase
      .from('mentoring_logs')
      .select('*, students!inner(name, class, period_id)')
      .eq('students.period_id', activePeriod.id)
      .order('date', { ascending: false });
      
    if (logsData) setLogs(logsData);
    
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
      category: formData.category,
      description: formData.description,
      follow_up: formData.follow_up,
      status: formData.status,
      user_id: user.id,
    };

    if (formData.id) {
      await supabase.from('mentoring_logs').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('mentoring_logs').insert([payload]);
    }

    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (confirm('Yakin ingin menghapus catatan ini?')) {
      await supabase.from('mentoring_logs').delete().eq('id', id);
      fetchData();
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = log.students.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory ? log.category === filterCategory : true;
    const matchStatus = filterStatus ? log.status === filterStatus : true;
    return matchSearch && matchCategory && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Baik': return 'bg-emerald-100 text-emerald-800';
      case 'Perlu Perhatian': return 'bg-amber-100 text-amber-800';
      case 'Butuh Tindak Lanjut': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (!activePeriod) {
    return <div className="text-center mt-10 text-slate-500">Pilih periode aktif terlebih dahulu.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Catatan Pembimbingan</h1>
        <button
          onClick={() => {
            setFormData({ 
              id: '', 
              student_id: students.length > 0 ? students[0].id : '', 
              date: format(new Date(), 'yyyy-MM-dd'), 
              category: 'Akademik', 
              description: '', 
              follow_up: '', 
              status: 'Baik' 
            });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Catatan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            className="ml-2 flex-1 border-0 bg-transparent focus:outline-none focus:ring-0 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          <option value="Akademik">Akademik</option>
          <option value="Sosial">Sosial</option>
          <option value="Psikologi">Psikologi</option>
          <option value="Spiritual">Spiritual</option>
          <option value="Karakter">Karakter</option>
          <option value="Kehadiran">Kehadiran</option>
        </select>
        <select
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="Baik">Baik</option>
          <option value="Perlu Perhatian">Perlu Perhatian</option>
          <option value="Butuh Tindak Lanjut">Butuh Tindak Lanjut</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100">Tidak ada catatan pembimbingan.</div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{log.students.name}</h3>
                    <span className="text-sm text-slate-500">({log.students.class})</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span>{format(new Date(log.date), 'dd MMM yyyy')}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="font-medium text-indigo-600">{log.category}</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deskripsi</span>
                      <p className="text-sm text-slate-700 mt-1">{log.description}</p>
                    </div>
                    {log.follow_up && (
                      <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tindak Lanjut</span>
                        <p className="text-sm text-slate-700 mt-1">{log.follow_up}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFormData(log);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-[95vw] sm:w-full max-w-lg rounded-2xl bg-white p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm font-medium text-slate-700">Kategori</label>
                  <select
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Sosial">Sosial</option>
                    <option value="Psikologi">Psikologi</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Karakter">Karakter</option>
                    <option value="Kehadiran">Kehadiran</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Status Perkembangan</label>
                <select
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Baik">Baik</option>
                  <option value="Perlu Perhatian">Perlu Perhatian</option>
                  <option value="Butuh Tindak Lanjut">Butuh Tindak Lanjut</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Deskripsi Masalah/Catatan</label>
                <textarea
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Tindak Lanjut (Opsional)</label>
                <textarea
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                  value={formData.follow_up || ''}
                  onChange={(e) => setFormData({ ...formData, follow_up: e.target.value })}
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
