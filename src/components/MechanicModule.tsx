import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Star,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Edit2,
  Trash2,
  X,
  Wrench,
  Award,
  Layers
} from 'lucide-react';
import type { Mechanic, Service, MechanicStatus } from '../types/index';
import { api } from '../services/apiClient';

interface MechanicModuleProps {
  mechanics: Mechanic[];
  services: Service[];
  onRefresh: () => void;
}

export const MechanicModule: React.FC<MechanicModuleProps> = ({
  mechanics,
  services,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);

  const [form, setForm] = useState({
    name: '',
    specialty: '',
    experienceYears: 5,
    rating: 4.8,
    phone: '',
    email: '',
    status: 'Available' as MechanicStatus,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenAdd = () => {
    setEditingMechanic(null);
    setForm({
      name: '',
      specialty: 'Engine Diagnostics & Overhaul',
      experienceYears: 5,
      rating: 4.8,
      phone: '+91 94480 99999',
      email: 'tech@autotech.in',
      status: 'Available',
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (mech: Mechanic) => {
    setEditingMechanic(mech);
    setForm({
      name: mech.name,
      specialty: mech.specialty,
      experienceYears: mech.experienceYears,
      rating: mech.rating,
      phone: mech.phone,
      email: mech.email,
      status: mech.status,
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.specialty.trim()) {
      setFormError('Name and Specialty are required.');
      return;
    }
    setLoading(true);
    try {
      if (editingMechanic) {
        await api.updateMechanic(editingMechanic._id, form);
      } else {
        await api.createMechanic(form);
      }
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Error saving mechanic');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove technician "${name}"?`)) return;
    try {
      await api.deleteMechanic(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            Mechanic Staff & Performance Metrics
          </h2>
          <p className="text-xs text-slate-400">
            {mechanics.length} certified technicians · Real-time workload allocation & efficiency ratings
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Technician</span>
        </button>
      </div>

      {/* Grid of Mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mechanics.map((mech) => {
          const mechServices = services.filter((s) => s.mechanicId === mech._id);
          const completedJobs = mechServices.filter((s) => s.status === 'Completed').length;
          const activeJobs = mechServices.filter((s) => s.status !== 'Completed').length;
          const totalHours = mechServices.reduce((sum, s) => sum + s.laborHours, 0);

          return (
            <div
              key={mech._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 font-bold text-sm border border-slate-700">
                      {mech.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{mech.name}</h3>
                      <div className="text-xs text-amber-400 mt-0.5">{mech.specialty}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                      mech.status === 'Available'
                        ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                        : mech.status === 'Busy'
                        ? 'bg-amber-950/70 text-amber-400 border-amber-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {mech.status}
                  </span>
                </div>

                {/* Rating & Experience */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold font-mono">{mech.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-500">/ 5.0</span>
                  </div>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-500" />
                    <span>{mech.experienceYears} Years Exp</span>
                  </div>
                </div>

                {/* Performance Metrics Stats */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Completed</div>
                    <div className="text-sm font-bold font-mono text-emerald-400">{completedJobs}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Active Bay</div>
                    <div className="text-sm font-bold font-mono text-amber-400">{activeJobs}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Labor Hrs</div>
                    <div className="text-sm font-bold font-mono text-sky-400">{totalHours}h</div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{mech.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>{mech.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">ID: {mech._id}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(mech)}
                    className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title="Edit Technician"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(mech._id, mech.name)}
                    className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                    title="Remove Technician"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Mechanic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-semibold text-slate-100">
                {editingMechanic ? 'Edit Technician Profile' : 'Add Technician to Roster'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Technician Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Anand Murthy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Specialty Discipline *</label>
                <input
                  type="text"
                  required
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  placeholder="e.g. Transmission & Gearbox Specialist"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quality Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step={0.1}
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as MechanicStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy (In Bay)</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-slate-950 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingMechanic ? 'Update Technician' : 'Add Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
