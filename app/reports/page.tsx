'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePeriod } from '@/components/PeriodProvider';
import { useAuth } from '@/components/AuthProvider';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { activePeriod } = usePeriod();
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      if (!supabase || !activePeriod) return;
      const { data } = await supabase
        .from('students')
        .select('id, name, class, nis')
        .eq('period_id', activePeriod.id)
        .order('name');
      if (data) setStudents(data);
    }
    fetchStudents();
  }, [activePeriod]);

  useEffect(() => {
    async function fetchReport() {
      if (!supabase || !selectedStudent || !activePeriod) return;
      setLoading(true);

      const student = students.find(s => s.id === selectedStudent);

      const { data: logs } = await supabase
        .from('mentoring_logs')
        .select('*')
        .eq('student_id', selectedStudent)
        .order('date', { ascending: true });

      const { data: comms } = await supabase
        .from('communications')
        .select('*')
        .eq('student_id', selectedStudent)
        .order('date', { ascending: true });

      // Calculate summary
      const summary = {
        totalLogs: logs?.length || 0,
        byCategory: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
      };

      logs?.forEach(log => {
        summary.byCategory[log.category] = (summary.byCategory[log.category] || 0) + 1;
        summary.byStatus[log.status] = (summary.byStatus[log.status] || 0) + 1;
      });

      setReportData({
        student,
        logs: logs || [],
        comms: comms || [],
        summary,
      });
      
      setLoading(false);
    }

    if (selectedStudent) {
      fetchReport();
    } else {
      setReportData(null);
    }
  }, [selectedStudent, activePeriod, students]);

  const handlePrint = () => {
    window.print();
  };

  if (!activePeriod) {
    return <div className="text-center mt-10 text-slate-500">Pilih periode aktif terlebih dahulu.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <h1 className="text-2xl font-bold text-slate-900">Laporan Akhir Tahun</h1>
        {reportData && (
          <button
            onClick={handlePrint}
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
          >
            <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 print:hidden">
        <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Siswa</label>
        <select
          className="block w-full max-w-md rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Pilih Siswa --</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
          ))}
        </select>
      </div>

      {loading && <div className="text-center py-10 text-slate-500 print:hidden">Loading laporan...</div>}

      {reportData && !loading && (
        <div className="rounded-2xl bg-white p-4 sm:p-8 shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
          {/* Print Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-wider">Laporan Pembimbingan Siswa</h1>
            <p className="text-lg mt-2">Tahun Ajaran: {activePeriod.name} - Semester {activePeriod.semester}</p>
            <div className="border-b-2 border-slate-800 mt-4 mb-6"></div>
          </div>

          {/* Student Info */}
          <div className="mb-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-semibold w-24 inline-block">Nama Siswa</span>: {reportData.student.name}</p>
              <p><span className="font-semibold w-24 inline-block">NIS</span>: {reportData.student.nis}</p>
            </div>
            <div>
              <p><span className="font-semibold w-24 inline-block">Kelas</span>: {reportData.student.class}</p>
              <p><span className="font-semibold w-24 inline-block">Guru Wali</span>: {user?.email}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Ringkasan Pembimbingan</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Berdasarkan Kategori</h4>
                <ul className="space-y-1 text-sm">
                  {Object.entries(reportData.summary.byCategory).map(([cat, count]) => (
                    <li key={cat} className="flex justify-between border-b border-slate-100 py-1">
                      <span>{cat}</span>
                      <span className="font-medium">{count as number} kali</span>
                    </li>
                  ))}
                  {Object.keys(reportData.summary.byCategory).length === 0 && (
                    <li className="text-slate-500 italic">Belum ada data.</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Berdasarkan Status Akhir</h4>
                <ul className="space-y-1 text-sm">
                  {Object.entries(reportData.summary.byStatus).map(([status, count]) => (
                    <li key={status} className="flex justify-between border-b border-slate-100 py-1">
                      <span>{status}</span>
                      <span className="font-medium">{count as number} kali</span>
                    </li>
                  ))}
                  {Object.keys(reportData.summary.byStatus).length === 0 && (
                    <li className="text-slate-500 italic">Belum ada data.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Detailed Logs */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Detail Catatan Pembimbingan</h3>
            {reportData.logs.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase border-b border-slate-200">Tanggal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase border-b border-slate-200">Kategori</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase border-b border-slate-200">Deskripsi & Tindak Lanjut</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase border-b border-slate-200">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {reportData.logs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-sm text-slate-900 align-top w-28">{format(new Date(log.date), 'dd/MM/yyyy')}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 align-top w-28">{log.category}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 align-top">
                        <p className="font-medium mb-1">Masalah:</p>
                        <p className="mb-2">{log.description}</p>
                        {log.follow_up && (
                          <>
                            <p className="font-medium mb-1">Tindak Lanjut:</p>
                            <p>{log.follow_up}</p>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 align-top w-32">{log.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-500 italic">Tidak ada catatan pembimbingan untuk siswa ini.</p>
            )}
          </div>

          {/* Communications */}
          {reportData.comms.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Catatan Komunikasi Pihak Terkait</h3>
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase border-b border-slate-200">Tanggal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase border-b border-slate-200">Pihak Terkait</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase border-b border-slate-200">Catatan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {reportData.comms.map((comm: any) => (
                    <tr key={comm.id}>
                      <td className="px-4 py-3 text-sm text-slate-900 align-top w-28">{format(new Date(comm.date), 'dd/MM/yyyy')}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 align-top w-36">{comm.type}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 align-top">{comm.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures */}
          <div className="mt-16 hidden print:flex justify-between px-10">
            <div className="text-center">
              <p className="mb-16">Mengetahui,<br/>Kepala Sekolah</p>
              <p className="font-bold underline">_______________________</p>
            </div>
            <div className="text-center">
              <p className="mb-16">Dibuat oleh,<br/>Guru Wali</p>
              <p className="font-bold underline">_______________________</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
