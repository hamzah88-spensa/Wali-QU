'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { usePeriod } from '@/components/PeriodProvider';
import { Users, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { activePeriod } = usePeriod();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentoring: 0,
    statusCounts: [] as any[],
    categoryCounts: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!supabase || !activePeriod) return;
      setLoading(true);

      // Fetch students count
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('period_id', activePeriod.id);

      // Fetch mentoring logs for the active period
      const { data: logs } = await supabase
        .from('mentoring_logs')
        .select('*, students!inner(period_id)')
        .eq('students.period_id', activePeriod.id);

      const totalMentoring = logs?.length || 0;

      // Calculate status counts
      const statusMap = new Map();
      const categoryMap = new Map();

      logs?.forEach(log => {
        statusMap.set(log.status, (statusMap.get(log.status) || 0) + 1);
        categoryMap.set(log.category, (categoryMap.get(log.category) || 0) + 1);
      });

      const statusCounts = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
      const categoryCounts = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

      setStats({
        totalStudents: studentCount || 0,
        totalMentoring,
        statusCounts,
        categoryCounts,
      });
      setLoading(false);
    }

    fetchStats();
  }, [activePeriod]);

  if (!activePeriod) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Silakan buat atau pilih periode terlebih dahulu di menu Pengaturan Periode.</p>
      </div>
    );
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Green, Yellow, Red

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center">
            <div className="rounded-xl bg-indigo-100 p-3">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Siswa</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center">
            <div className="rounded-xl bg-purple-100 p-3">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Pembimbingan</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.totalMentoring}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Statistik Kategori</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryCounts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Status Perkembangan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusCounts.map((entry, index) => {
                    let color = COLORS[0];
                    if (entry.name === 'Perlu Perhatian') color = COLORS[1];
                    if (entry.name === 'Butuh Tindak Lanjut') color = COLORS[2];
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Baik</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Perlu Perhatian</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Tindak Lanjut</div>
          </div>
        </div>
      </div>
    </div>
  );
}
