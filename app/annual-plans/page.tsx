'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePeriod } from '@/components/PeriodProvider';
import { useAuth } from '@/components/AuthProvider';
import { Printer } from 'lucide-react';

export default function AnnualPlansPage() {
  const { activePeriod } = usePeriod();
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    academic_target: '',
    talent_interest_target: '',
    character_target: '',
    strategy: '',
    priority_program: '',
    collaboration_notes: '',
  });

  const fetchPlan = async () => {
    if (!supabase || !activePeriod || !user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('annual_plans')
      .select('*')
      .eq('period_id', activePeriod.id)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPlan(data);
      setFormData(data);
    } else {
      setPlan(null);
      setFormData({
        id: '',
        academic_target: '',
        talent_interest_target: '',
        character_target: '',
        strategy: '',
        priority_program: '',
        collaboration_notes: '',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlan();
  }, [activePeriod, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !activePeriod || !user) return;

    const payload = {
      period_id: activePeriod.id,
      user_id: user.id,
      academic_target: formData.academic_target,
      talent_interest_target: formData.talent_interest_target,
      character_target: formData.character_target,
      strategy: formData.strategy,
      priority_program: formData.priority_program,
      collaboration_notes: formData.collaboration_notes,
    };

    if (plan?.id) {
      await supabase.from('annual_plans').update(payload).eq('id', plan.id);
    } else {
      await supabase.from('annual_plans').insert([payload]);
    }

    setIsEditing(false);
    fetchPlan();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!activePeriod) {
    return <div className="text-center mt-10 text-slate-500">Pilih periode aktif terlebih dahulu.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <h1 className="text-2xl font-bold text-slate-900">Rencana Tahunan</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-xl bg-white border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {isEditing ? 'Batal Edit' : (plan ? 'Edit Rencana' : 'Buat Rencana')}
          </button>
          {plan && !isEditing && (
            <button
              onClick={handlePrint}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
            >
              <Printer className="mr-2 h-4 w-4" /> Cetak
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading...</div>
      ) : isEditing ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 print:hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Target Perkembangan</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Target Akademik</label>
                  <textarea
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={3}
                    value={formData.academic_target || ''}
                    onChange={(e) => setFormData({ ...formData, academic_target: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Target Bakat & Minat</label>
                  <textarea
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={3}
                    value={formData.talent_interest_target || ''}
                    onChange={(e) => setFormData({ ...formData, talent_interest_target: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Target Karakter</label>
                  <textarea
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={3}
                    value={formData.character_target || ''}
                    onChange={(e) => setFormData({ ...formData, character_target: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Strategi & Program</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Strategi Pembimbingan</label>
                  <textarea
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={3}
                    value={formData.strategy || ''}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Program Prioritas</label>
                  <textarea
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={3}
                    value={formData.priority_program || ''}
                    onChange={(e) => setFormData({ ...formData, priority_program: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Catatan Kolaborasi (Orang Tua/Guru)</label>
                  <textarea
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={3}
                    value={formData.collaboration_notes || ''}
                    onChange={(e) => setFormData({ ...formData, collaboration_notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition"
              >
                Simpan Rencana
              </button>
            </div>
          </form>
        </div>
      ) : plan ? (
        <div className="rounded-2xl bg-white p-4 sm:p-8 shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
          <div className="text-center mb-8 hidden print:block">
            <h1 className="text-2xl font-bold uppercase">Rencana Tahunan Pembimbingan Siswa</h1>
            <p className="text-lg mt-2">Tahun Ajaran: {activePeriod.name} - Semester {activePeriod.semester}</p>
            <p className="text-md mt-1">Guru Wali: {user?.email}</p>
            <div className="border-b-2 border-slate-800 mt-4 mb-8"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 print:grid-cols-1 print:gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b-2 border-indigo-100 pb-2 mb-4 print:border-slate-300">Target Perkembangan</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider print:text-slate-800">Target Akademik</h4>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{plan.academic_target || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider print:text-slate-800">Target Bakat & Minat</h4>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{plan.talent_interest_target || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider print:text-slate-800">Target Karakter</h4>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{plan.character_target || '-'}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b-2 border-purple-100 pb-2 mb-4 print:border-slate-300">Strategi & Program</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wider print:text-slate-800">Strategi Pembimbingan</h4>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{plan.strategy || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wider print:text-slate-800">Program Prioritas</h4>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{plan.priority_program || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wider print:text-slate-800">Catatan Kolaborasi</h4>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{plan.collaboration_notes || '-'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 hidden print:flex justify-end">
            <div className="text-center">
              <p className="mb-16">Mengetahui,</p>
              <p className="font-bold underline">Guru Wali</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100 print:hidden">
          Belum ada rencana tahunan untuk periode ini.
        </div>
      )}
    </div>
  );
}
