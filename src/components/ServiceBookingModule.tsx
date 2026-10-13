import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  User,
  Car as CarIcon,
  DollarSign,
  Package,
  ArrowRight,
  X,
  FileText,
  Trash2,
  Tag
} from 'lucide-react';
import type {
  Service,
  Car,
  Customer,
  Mechanic,
  SparePart,
  ServiceStatus,
  ServiceType,
  Priority,
  PartUsage,
} from '../types/index';
import { api } from '../services/apiClient';

interface ServiceBookingModuleProps {
  services: Service[];
  cars: Car[];
  customers: Customer[];
  mechanics: Mechanic[];
  spareParts: SparePart[];
  onRefresh: () => void;
  preselectedCar?: Car | null;
  onClearPreselectedCar?: () => void;
}

export const ServiceBookingModule: React.FC<ServiceBookingModuleProps> = ({
  services,
  cars,
  customers,
  mechanics,
  spareParts,
  onRefresh,
  preselectedCar,
  onClearPreselectedCar,
}) => {
  const [activeTabStatus, setActiveTabStatus] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');

  // New Service Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formCarId, setFormCarId] = useState<string>('');
  const [formMechanicId, setFormMechanicId] = useState<string>('');
  const [formServiceType, setFormServiceType] = useState<ServiceType>('General Maintenance');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('Medium');
  const [formStatus, setFormStatus] = useState<ServiceStatus>('Pending');
  const [formLaborHours, setFormLaborHours] = useState(2);
  const [formEstimatedCost, setFormEstimatedCost] = useState(4500);
  const [formPartsUsed, setFormPartsUsed] = useState<PartUsage[]>([]);

  // Selected spare part to add to this service
  const [selectedPartIdToAdd, setSelectedPartIdToAdd] = useState('');
  const [selectedPartQuantityToAdd, setSelectedPartQuantityToAdd] = useState(1);

  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // If preselected car arrived from customer fleet
  React.useEffect(() => {
    if (preselectedCar) {
      setFormCarId(preselectedCar._id);
      setShowAddModal(true);
      if (onClearPreselectedCar) onClearPreselectedCar();
    }
  }, [preselectedCar]);

  // Maps for quick lookup
  const carMap = new Map<string, Car>();
  cars.forEach((c) => carMap.set(c._id, c));

  const customerMap = new Map<string, Customer>();
  customers.forEach((c) => customerMap.set(c._id, c));

  const mechanicMap = new Map<string, Mechanic>();
  mechanics.forEach((m) => mechanicMap.set(m._id, m));

  // Filter services
  const filteredServices = services.filter((srv) => {
    const matchesStatus = activeTabStatus === 'All' || srv.status === activeTabStatus;
    const matchesPriority = priorityFilter === 'All' || srv.priority === priorityFilter;

    const car = carMap.get(srv.carId);
    const cust = customerMap.get(srv.customerId);
    const mech = mechanicMap.get(srv.mechanicId);

    const q = search.toLowerCase();
    const matchesSearch =
      srv._id.toLowerCase().includes(q) ||
      srv.serviceType.toLowerCase().includes(q) ||
      srv.description.toLowerCase().includes(q) ||
      (car && (car.licensePlate.toLowerCase().includes(q) || car.brand.toLowerCase().includes(q))) ||
      (cust && cust.name.toLowerCase().includes(q)) ||
      (mech && mech.name.toLowerCase().includes(q));

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormCarId(cars[0]?._id || '');
    setFormMechanicId(mechanics[0]?._id || '');
    setFormServiceType('General Maintenance');
    setFormDescription('Standard vehicle inspection and routine maintenance.');
    setFormPriority('Medium');
    setFormStatus('Pending');
    setFormLaborHours(2);
    setFormEstimatedCost(4500);
    setFormPartsUsed([]);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleAddPartToForm = () => {
    if (!selectedPartIdToAdd) return;
    const part = spareParts.find((p) => p._id === selectedPartIdToAdd);
    if (!part) return;

    const existingIndex = formPartsUsed.findIndex((p) => p.partId === part._id);
    if (existingIndex > -1) {
      const updated = [...formPartsUsed];
      updated[existingIndex].quantity += selectedPartQuantityToAdd;
      setFormPartsUsed(updated);
    } else {
      setFormPartsUsed([
        ...formPartsUsed,
        {
          partId: part._id,
          partName: part.name,
          quantity: selectedPartQuantityToAdd,
          unitPrice: part.sellingPrice,
        },
      ]);
    }

    // Auto-update estimated cost
    const partsTotal =
      formPartsUsed.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0) +
      part.sellingPrice * selectedPartQuantityToAdd;
    const laborTotal = formLaborHours * 800;
    setFormEstimatedCost(partsTotal + laborTotal);

    setSelectedPartIdToAdd('');
    setSelectedPartQuantityToAdd(1);
  };

  const handleRemovePartFromForm = (index: number) => {
    const updated = formPartsUsed.filter((_, i) => i !== index);
    setFormPartsUsed(updated);
    const partsTotal = updated.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
    setFormEstimatedCost(partsTotal + formLaborHours * 800);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCarId || !formServiceType) {
      setFormError('Please select a vehicle and service category.');
      return;
    }
    const selectedCar = carMap.get(formCarId);
    if (!selectedCar) {
      setFormError('Invalid vehicle selected.');
      return;
    }

    setLoading(true);
    try {
      if (editingService) {
        await api.updateService(editingService._id, {
          carId: formCarId,
          customerId: selectedCar.customerId,
          mechanicId: formMechanicId,
          serviceType: formServiceType,
          description: formDescription,
          priority: formPriority,
          status: formStatus,
          laborHours: formLaborHours,
          estimatedCost: formEstimatedCost,
          partsUsed: formPartsUsed,
        });
        setNotification('Service updated successfully!');
      } else {
        await api.createService({
          carId: formCarId,
          customerId: selectedCar.customerId,
          mechanicId: formMechanicId,
          serviceType: formServiceType,
          description: formDescription,
          priority: formPriority,
          status: formStatus,
          laborHours: formLaborHours,
          estimatedCost: formEstimatedCost,
          actualCost: formStatus === 'Completed' ? formEstimatedCost : 0,
          partsUsed: formPartsUsed,
        });
        setNotification('New service booking created and queued in workshop!');
      }

      setShowAddModal(false);
      onRefresh();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Error saving service');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusTransition = async (serviceId: string, nextStatus: ServiceStatus) => {
    try {
      await api.updateServiceStatus(serviceId, nextStatus);
      if (nextStatus === 'Completed') {
        setNotification(`Service marked Completed. Automated tax invoice and vehicle service history generated!`);
      } else {
        setNotification(`Service status moved to "${nextStatus}".`);
      }
      onRefresh();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(`Status transition error: ${err.message}`);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and remove this service booking?')) return;
    try {
      await api.deleteService(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting service: ${err.message}`);
    }
  };

  // Status columns for Kanban
  const kanbanColumns: { status: ServiceStatus; label: string; color: string; badge: string }[] = [
    { status: 'Pending', label: 'Pending Inspection', color: 'border-sky-500/40', badge: 'bg-sky-950/60 text-sky-400 border-sky-800' },
    { status: 'In Progress', label: 'Active in Bay', color: 'border-amber-500/40', badge: 'bg-amber-950/60 text-amber-400 border-amber-800' },
    { status: 'Awaiting Parts', label: 'Awaiting Parts', color: 'border-orange-500/40', badge: 'bg-orange-950/60 text-orange-400 border-orange-800' },
    { status: 'Completed', label: 'Completed & Tested', color: 'border-emerald-500/40', badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-800' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Control Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            Service Booking, Bay Tracking & Workflow
          </h2>
          <p className="text-xs text-slate-400">
            {services.length} total services · {services.filter((s) => s.status !== 'Completed').length} active in bays
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search car, customer, mechanic..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 w-56 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <span className="text-[10px] text-slate-500 px-1.5">Priority:</span>
            {['All', 'Low', 'Medium', 'High', 'Urgent'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  priorityFilter === p ? 'bg-slate-800 text-amber-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'board' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Service</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const columnServices = filteredServices.filter((s) => s.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col max-h-[800px] overflow-hidden"
              >
                {/* Column Header */}
                <div className={`p-3 border-b ${col.color} bg-slate-950/70 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{col.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${col.badge}`}>
                      {columnServices.length}
                    </span>
                  </div>
                </div>

                {/* Column Items */}
                <div className="p-3 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
                  {columnServices.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No jobs in this stage.
                    </div>
                  ) : (
                    columnServices.map((srv) => {
                      const car = carMap.get(srv.carId);
                      const cust = customerMap.get(srv.customerId);
                      const mech = mechanicMap.get(srv.mechanicId);

                      return (
                        <div
                          key={srv._id}
                          className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-2.5"
                        >
                          <div>
                            {/* License & Priority */}
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/80 px-1.5 py-0.5 rounded">
                                {car?.licensePlate || srv.carId}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                                  srv.priority === 'Urgent'
                                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                    : srv.priority === 'High'
                                    ? 'bg-orange-950/80 text-orange-300 border-orange-800'
                                    : srv.priority === 'Medium'
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                {srv.priority}
                              </span>
                            </div>

                            <div className="text-xs font-semibold text-slate-200 mt-1.5 truncate">
                              {srv.serviceType}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                              {srv.description}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="pt-2 border-t border-slate-800/60 space-y-1 text-[11px] text-slate-400">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Customer:</span>
                              <span className="text-slate-300 truncate max-w-[120px]">{cust?.name || 'Customer'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Mechanic:</span>
                              <span className="text-slate-300 truncate max-w-[120px]">{mech?.name || 'Master Tech'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Labor / Est:</span>
                              <span className="font-mono text-slate-200">
                                {srv.laborHours}h · ₹{(srv.actualCost || srv.estimatedCost).toLocaleString()}
                              </span>
                            </div>

                            {srv.partsUsed && srv.partsUsed.length > 0 && (
                              <div className="text-[10px] text-slate-400 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                                <strong>Parts ({srv.partsUsed.length}):</strong>{' '}
                                {srv.partsUsed.map((p) => `${p.partName} (x${p.quantity})`).join(', ')}
                              </div>
                            )}
                          </div>

                          {/* Workflow status advance buttons */}
                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1">
                            {srv.status === 'Pending' && (
                              <button
                                onClick={() => handleStatusTransition(srv._id, 'In Progress')}
                                className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <span>Move to Bay</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            {srv.status === 'In Progress' && (
                              <div className="w-full flex items-center gap-1">
                                <button
                                  onClick={() => handleStatusTransition(srv._id, 'Awaiting Parts')}
                                  className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors cursor-pointer"
                                >
                                  Wait Parts
                                </button>
                                <button
                                  onClick={() => handleStatusTransition(srv._id, 'Completed')}
                                  className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                                >
                                  Complete
                                </button>
                              </div>
                            )}
                            {srv.status === 'Awaiting Parts' && (
                              <button
                                onClick={() => handleStatusTransition(srv._id, 'In Progress')}
                                className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <span>Resume Service</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            {srv.status === 'Completed' && (
                              <div className="w-full flex items-center justify-between text-[11px] text-emerald-400">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Billed & Certified</span>
                                </span>
                                <span className="font-mono text-slate-400">
                                  ₹{srv.actualCost.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Service ID & Vehicle</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Mechanic</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Cost / Labor</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredServices.map((srv) => {
                  const car = carMap.get(srv.carId);
                  const cust = customerMap.get(srv.customerId);
                  const mech = mechanicMap.get(srv.mechanicId);

                  return (
                    <tr key={srv._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-amber-300 font-semibold">{car?.licensePlate}</div>
                        <div className="text-[11px] text-slate-400">{car?.brand} {car?.model} · <span className="text-slate-500 font-mono">{srv._id}</span></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{cust?.name}</div>
                        <div className="text-[11px] text-slate-500">{cust?.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{srv.serviceType}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{srv.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-200">{mech?.name}</div>
                        <div className="text-[11px] text-slate-500">{mech?.specialty}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          srv.status === 'Completed'
                            ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                            : srv.status === 'In Progress'
                            ? 'bg-amber-950/70 text-amber-400 border-amber-800'
                            : srv.status === 'Awaiting Parts'
                            ? 'bg-orange-950/70 text-orange-400 border-orange-800'
                            : 'bg-sky-950/70 text-sky-400 border-sky-800'
                        }`}>
                          {srv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div>₹{(srv.actualCost || srv.estimatedCost).toLocaleString()}</div>
                        <div className="text-[11px] text-slate-500">{srv.laborHours} labor hrs</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {srv.status !== 'Completed' && (
                          <button
                            onClick={() => handleStatusTransition(srv._id, 'Completed')}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium transition-colors cursor-pointer mr-2"
                          >
                            Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteService(srv._id)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Remove booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book New Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                <span>Create Service Ticket & Bay Assignment</span>
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

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Vehicle *</label>
                  <select
                    required
                    value={formCarId}
                    onChange={(e) => setFormCarId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {cars.map((c) => {
                      const cust = customerMap.get(c.customerId);
                      return (
                        <option key={c._id} value={c._id}>
                          {c.licensePlate} - {c.brand} {c.model} ({cust?.name})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Mechanic *</label>
                  <select
                    required
                    value={formMechanicId}
                    onChange={(e) => setFormMechanicId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {mechanics.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} - {m.specialty} ({m.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Service Type *</label>
                  <select
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value as ServiceType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="General Maintenance">General Maintenance</option>
                    <option value="Brake System">Brake System</option>
                    <option value="Engine Diagnostics">Engine Diagnostics</option>
                    <option value="Transmission Repair">Transmission Repair</option>
                    <option value="Electrical & Battery">Electrical & Battery</option>
                    <option value="AC & Climate">AC & Climate</option>
                    <option value="Tire & Suspension">Tire & Suspension</option>
                    <option value="Oil & Filter Change">Oil & Filter Change</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (Breakdown)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ServiceStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Pending">Pending Inspection</option>
                    <option value="In Progress">In Progress (Bay Active)</option>
                    <option value="Awaiting Parts">Awaiting Parts</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Job Description & Customer Complaints</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail symptoms, diagnostic trouble codes, or customer requests..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Spare Parts Allocation Picker */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    Allocate Spare Parts from Inventory
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Deducts stock automatically</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedPartIdToAdd}
                    onChange={(e) => setSelectedPartIdToAdd(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="">-- Choose Spare Part --</option>
                    {spareParts.map((part) => (
                      <option key={part._id} value={part._id}>
                        {part.name} ({part.partNumber}) - ₹{part.sellingPrice} (Stock: {part.stockQuantity})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={selectedPartQuantityToAdd}
                    onChange={(e) => setSelectedPartQuantityToAdd(Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs font-mono text-slate-200 text-center"
                  />

                  <button
                    type="button"
                    onClick={handleAddPartToForm}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-medium transition-colors cursor-pointer"
                  >
                    Add Part
                  </button>
                </div>

                {/* Allocated parts list */}
                {formPartsUsed.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formPartsUsed.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-xs"
                      >
                        <div>
                          <span className="text-slate-200 font-medium">{p.partName}</span>
                          <span className="text-slate-400 ml-2 font-mono">
                            Qty: {p.quantity} × ₹{p.unitPrice} = ₹{(p.quantity * p.unitPrice).toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePartFromForm(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Labor (Hours)</label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    value={formLaborHours}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      setFormLaborHours(h);
                      const partsTotal = formPartsUsed.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
                      setFormEstimatedCost(partsTotal + h * 800);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Estimated Cost (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formEstimatedCost}
                    onChange={(e) => setFormEstimatedCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-slate-950 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Service Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
