'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SizeChart, SizeChartRow } from '@/lib/types';
import { saveSizeChartAction, deleteSizeChartAction } from '@/app/actions/store';
import { Ruler, Plus, Trash2, Edit2, Save, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SizeChartsManagerClientProps {
  initialCharts: SizeChart[];
}

export default function SizeChartsManagerClient({ initialCharts }: SizeChartsManagerClientProps) {
  const router = useRouter();
  const [charts, setCharts] = useState<SizeChart[]>(initialCharts);
  const [editingChart, setEditingChart] = useState<SizeChart | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<{ id: string; name: string } | null>(null);

  const startNewChart = () => {
    const newChart: SizeChart = {
      id: '',
      name: 'New Size Chart',
      unit: 'Inches',
      columns: ['Size', 'Bust', 'Waist', 'Hips'],
      rows: [
        { size: 'S', bust: '34"', waist: '26"', hips: '36"' },
        { size: 'M', bust: '36"', waist: '28"', hips: '38"' },
        { size: 'L', bust: '38"', waist: '30"', hips: '40"' },
        { size: 'XL', bust: '40"', waist: '32"', hips: '42"' },
      ],
      notes: 'Standard measurements. Contact us on WhatsApp for custom sizing.',
      is_default: charts.length === 0,
    };
    setEditingChart(newChart);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChart) return;
    if (!editingChart.name.trim()) {
      alert('Please provide a name for this size chart.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveSizeChartAction(editingChart);
      if (!res.success || !res.chart) {
        alert(`Could not save size chart: ${res.error}`);
        setIsSaving(false);
        return;
      }

      setCharts((prev) => {
        const existingIdx = prev.findIndex((c) => c.id === res.chart!.id);
        if (existingIdx >= 0) {
          return prev.map((c) => (c.id === res.chart!.id ? res.chart! : (res.chart!.is_default ? { ...c, is_default: false } : c)));
        }
        return [...prev.map((c) => res.chart!.is_default ? { ...c, is_default: false } : c), res.chart!];
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setEditingChart(null);
      }, 500);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to save size chart:', err);
      alert('Error saving size chart: ' + (err?.message || 'Server error'));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!chartToDelete) return;
    const { id } = chartToDelete;
    const previous = [...charts];
    setCharts((prev) => prev.filter((c) => c.id !== id));
    setChartToDelete(null);

    try {
      const res = await deleteSizeChartAction(id);
      if (!res.success) {
        setCharts(previous);
        alert('Could not delete size chart: ' + res.error);
        return;
      }
      if (editingChart?.id === id) {
        setEditingChart(null);
      }
      router.refresh();
    } catch (err: any) {
      setCharts(previous);
      alert('Error deleting size chart: ' + err?.message);
    }
  };

  // Row operations inside editor
  const updateRowValue = (rowIdx: number, columnKey: string, value: string) => {
    if (!editingChart) return;
    setEditingChart((prev) => {
      if (!prev) return prev;
      const nextRows = [...prev.rows];
      nextRows[rowIdx] = {
        ...nextRows[rowIdx],
        [columnKey.toLowerCase()]: value,
      };
      return { ...prev, rows: nextRows };
    });
  };

  const addRow = () => {
    if (!editingChart) return;
    setEditingChart((prev) => {
      if (!prev) return prev;
      const newRow: SizeChartRow = { size: 'Custom' };
      prev.columns.forEach((col) => {
        if (col.toLowerCase() !== 'size') {
          newRow[col.toLowerCase()] = '-';
        }
      });
      return { ...prev, rows: [...prev.rows, newRow] };
    });
  };

  const removeRow = (rowIdx: number) => {
    if (!editingChart) return;
    setEditingChart((prev) => {
      if (!prev) return prev;
      return { ...prev, rows: prev.rows.filter((_, idx) => idx !== rowIdx) };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1A1A1A] font-light">
            Size Charts
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Manage measurement guides and size charts for your products.
          </p>
        </div>
        {!editingChart && (
          <button
            type="button"
            onClick={startNewChart}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Size Chart</span>
          </button>
        )}
      </div>

      {/* Editor or List View */}
      {editingChart ? (
        <form onSubmit={handleSave} className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs rounded-xs">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingChart(null)}
                className="p-2 border border-neutral-200 hover:bg-neutral-100 rounded-xs text-neutral-600"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-semibold text-neutral-900">
                {editingChart.id ? `Edit Size Chart: ${editingChart.name}` : 'New Size Chart'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingChart(null)}
                className="min-h-[40px] px-4 py-2 border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50 rounded-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[40px] px-5 py-2 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center gap-2 active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Chart'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                Chart Name *
              </label>
              <input
                type="text"
                required
                value={editingChart.name}
                onChange={(e) => setEditingChart({ ...editingChart, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                placeholder="e.g. Standard Dresses Sizing"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                Measurement Unit
              </label>
              <select
                value={editingChart.unit}
                onChange={(e) => setEditingChart({ ...editingChart, unit: e.target.value as 'Inches' | 'cm' })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
              >
                <option value="Inches">Inches (")</option>
                <option value="cm">Centimeters (cm)</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-800 font-medium select-none">
                <input
                  type="checkbox"
                  checked={editingChart.is_default}
                  onChange={(e) => setEditingChart({ ...editingChart, is_default: e.target.checked })}
                  className="w-4 h-4 text-[#FF55D2] focus:ring-[#FF55D2] rounded-xs"
                />
                <span>Set as default size chart for all products</span>
              </label>
            </div>
          </div>

          {/* Measurements Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800">
                Measurements Table
              </label>
              <button
                type="button"
                onClick={addRow}
                className="text-xs text-[#FF55D2] hover:text-[#FD00B9] font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
                    {editingChart.columns.map((col) => (
                      <th key={col} className="p-3 font-semibold uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {editingChart.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-neutral-50/50">
                      {editingChart.columns.map((col) => {
                        const key = col.toLowerCase();
                        const val = key === 'size' ? row.size : (row[key] || '');
                        return (
                          <td key={col} className="p-2">
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => updateRowValue(rowIdx, col, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2]"
                              placeholder={`e.g. 34"`}
                            />
                          </td>
                        );
                      })}
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeRow(rowIdx)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-xs active:scale-90"
                          title="Remove row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Helpful Notes for Customers
            </label>
            <input
              type="text"
              value={editingChart.notes || ''}
              onChange={(e) => setEditingChart({ ...editingChart, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
              placeholder="e.g. Need a custom fit? Contact us on WhatsApp for made-to-measure sizing."
            />
          </div>
        </form>
      ) : (
        /* Size Charts List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {charts.length === 0 ? (
            <div className="col-span-2 py-12 text-center bg-white border border-neutral-200 rounded-xs text-neutral-400 text-xs">
              No size charts configured yet. Click "Add Size Chart" above to create your first guide.
            </div>
          ) : (
            charts.map((chart) => (
              <div
                key={chart.id}
                className="bg-white border border-neutral-200 p-5 rounded-xs space-y-4 shadow-xs hover:border-[#FF55D2]/50 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#FF55D2]">
                        <Ruler className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-medium text-neutral-900">
                          {chart.name}
                        </h3>
                        <span className="text-[11px] text-neutral-400">Unit: {chart.unit}</span>
                      </div>
                    </div>
                    {chart.is_default && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase tracking-wider font-semibold rounded-xs">
                        Default
                      </span>
                    )}
                  </div>

                  {/* Mini Preview Table */}
                  <div className="overflow-x-auto border border-neutral-100 rounded-xs">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
                          {chart.columns.map((c) => (
                            <th key={c} className="p-2 font-medium">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-neutral-700">
                        {chart.rows.slice(0, 4).map((r, idx) => (
                          <tr key={idx}>
                            {chart.columns.map((c) => (
                              <td key={c} className="p-2 font-mono">
                                {c.toLowerCase() === 'size' ? r.size : r[c.toLowerCase()] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {chart.notes && (
                    <p className="text-[11px] text-neutral-500 italic">
                      "{chart.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setEditingChart(chart)}
                    className="min-h-[40px] px-3.5 py-1.5 border border-neutral-200 hover:border-black text-neutral-700 text-xs font-semibold rounded-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartToDelete({ id: chart.id, name: chart.name })}
                    className="min-h-[40px] px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {chartToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-neutral-200 rounded-xs max-w-sm w-full p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Delete Size Chart?</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Are you sure you want to remove <strong className="text-neutral-800 font-semibold">"{chartToDelete.name}"</strong>? Products linked to this chart will fall back to standard sizing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setChartToDelete(null)}
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors active:scale-95 shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
