import React, { useState } from 'react';
import {
  History,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Gauge,
  ShieldCheck,
  Search,
  ChevronRight,
  Info,
  Car as CarIcon,
  Wrench,
  DollarSign,
  User,
  Activity
} from 'lucide-react';
import type {
  ServiceHistoryItem,
  PredictiveAlert,
  Car,
  Customer,
} from '../types/index';

interface ServiceHistoryModuleProps {
  history: ServiceHistoryItem[];
  predictiveAlerts: PredictiveAlert[];
  cars: Car[];
  customers: Customer[];
  onRefresh: () => void;
  onBookService: (car: Car) => void;
}

export const ServiceHistoryModule: React.FC<ServiceHistoryModuleProps> = ({
  history,
  predictiveAlerts,
  cars,
  customers,
  onRefresh,
  onBookService,
}) => {
  const [selectedCarId, setSelectedCarId] = useState<string>(cars[0]?._id || '');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Overdue' | 'Upcoming Soon' | 'Normal'>('All');
  const [search, setSearch] = useState('');

  const customerMap = new Map<string, Customer>();
  customers.forEach((c) => customerMap.set(c._id, c));

  const carMap = new Map<string, Car>();
  cars.forEach((c) => carMap.set(c._id, c));

  // Filter alerts across fleet
  const filteredAlerts = predictiveAlerts.filter((alert) => {
    const matchesFilter = statusFilter === 'All' || alert.alertLevel === statusFilter;
    const q = search.toLowerCase();
    const cust = alert.customer;
    const matchesSearch =
      alert.car.licensePlate.toLowerCase().includes(q) ||
      alert.car.brand.toLowerCase().includes(q) ||
      alert.car.model.toLowerCase().includes(q) ||
      (cust && cust.name.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  // Selected car details & history
  const selectedAlert = predictiveAlerts.find((a) => a.carId === selectedCarId) || predictiveAlerts[0];
  const selectedCarHistory = history.filter((h) => h.carId === selectedCarId);

  const overdueCount = predictiveAlerts.filter((a) => a.alertLevel === 'Overdue').length;
  const upcomingCount = predictiveAlerts.filter((a) => a.alertLevel === 'Upcoming Soon').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Deterministic Vehicle Health Scoring
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">Historical Interval Statistical Model</span>
          </div>
          <h2 className="text-base font-semibold text-slate-100 mt-0.5 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            Service History & Predictive Maintenance Alerts
          </h2>
          <p className="text-xs text-slate-400">
            Explainable mathematical health scores and upcoming maintenance interval forecasting
          </p>
        </div>

        {/* Explainability disclaimer tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
          <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span className="text-[11px]">
            Statistical interval calculation (Transparent & auditable, non-ML).
          </span>
        </div>
      </div>

      {/* Fleet Alert Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setStatusFilter(statusFilter === 'Overdue' ? 'All' : 'Overdue')}
          className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-colors ${
            statusFilter === 'Overdue' ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-400">Overdue Service Alerts</div>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {overdueCount} Vehicles
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Immediate inspection recommended
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'Upcoming Soon' ? 'All' : 'Upcoming Soon')}
          className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-colors ${
            statusFilter === 'Upcoming Soon' ? 'border-amber-500' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-400">Upcoming Due (&le; 30 Days)</div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {upcomingCount} Vehicles
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Approaching interval threshold
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'Normal' ? 'All' : 'Normal')}
          className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-colors ${
            statusFilter === 'Normal' ? 'border-emerald-500' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-400">Healthy Fleet Operating</div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {predictiveAlerts.length - overdueCount - upcomingCount} Vehicles
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Optimal operating condition
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Fleet List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden max-h-[850px]">
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-800 space-y-2.5 bg-slate-950/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Fleet Vehicles ({filteredAlerts.length})
              </h3>
              {statusFilter !== 'All' && (
                <button
                  onClick={() => setStatusFilter('All')}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Clear filter ({statusFilter})
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by plate, brand, customer..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Vehicle Items List */}
          <div className="p-2 overflow-y-auto space-y-1.5 flex-1 scrollbar-thin">
            {filteredAlerts.map((alert) => {
              const isSelected = alert.carId === selectedCarId;
              const isOverdue = alert.alertLevel === 'Overdue';
              const isUpcoming = alert.alertLevel === 'Upcoming Soon';

              return (
                <button
                  key={alert.carId}
                  onClick={() => setSelectedCarId(alert.carId)}
                  className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/40 text-slate-100 shadow-sm'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-amber-300">
                      {alert.car.licensePlate}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isOverdue
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                          : isUpcoming
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {alert.alertLevel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-xs font-medium text-slate-200">
                    <span>{alert.car.brand} {alert.car.model}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Score: {alert.healthScore.score}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span>{alert.customer?.name || 'Customer'}</span>
                    <span className="font-mono">{alert.currentMileage.toLocaleString()} km</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Vehicle Analysis & History Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedAlert ? (
            <>
              {/* Card 1: Explainable Health Score Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
                        {selectedAlert.car.licensePlate}
                      </span>
                      <h3 className="text-base font-semibold text-slate-100">
                        {selectedAlert.car.brand} {selectedAlert.car.model} ({selectedAlert.car.year})
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Owner: <strong className="text-slate-200">{selectedAlert.customer?.name}</strong> ·{' '}
                      VIN: <span className="font-mono">{selectedAlert.car.vin}</span> ·{' '}
                      {selectedAlert.currentMileage.toLocaleString()} km
                    </p>
                  </div>

                  <button
                    onClick={() => onBookService(selectedAlert.car)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Book Service Ticket</span>
                  </button>
                </div>

                {/* Score Visual Meter & Factors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                  {/* Gauge Display */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Service Health Score
                    </div>
                    <div className="relative my-3 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900">
                        <span
                          className={`text-3xl font-extrabold font-mono ${
                            selectedAlert.healthScore.score >= 90
                              ? 'text-emerald-400'
                              : selectedAlert.healthScore.score >= 75
                              ? 'text-sky-400'
                              : selectedAlert.healthScore.score >= 60
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {selectedAlert.healthScore.score}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                        selectedAlert.healthScore.category === 'Excellent'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : selectedAlert.healthScore.category === 'Good'
                          ? 'bg-sky-950 text-sky-400 border-sky-800'
                          : selectedAlert.healthScore.category === 'Fair'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}
                    >
                      {selectedAlert.healthScore.category} Condition
                    </span>
                  </div>

                  {/* Explainable Factors List */}
                  <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Explainable Score Breakdown</span>
                        <span className="text-[10px] text-slate-500 font-mono">Additive Factors</span>
                      </div>
                      <div className="space-y-1.5">
                        {selectedAlert.healthScore.factors.map((f, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0"
                          >
                            <span className="text-slate-300">{f.factor}</span>
                            <span
                              className={`font-mono font-semibold ${
                                f.impact > 0
                                  ? 'text-emerald-400'
                                  : f.impact < 0
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {f.impact > 0 ? `+${f.impact}` : f.impact} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 italic">
                      {selectedAlert.healthScore.explanation}
                    </p>
                  </div>
                </div>

                {/* Upcoming Service Projection */}
                <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Historical Service Interval Projection
                      </h4>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        selectedAlert.isOverdue
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800'
                      }`}
                    >
                      {selectedAlert.isOverdue ? 'Overdue Maintenance' : 'Upcoming Next Service'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Avg Interval</div>
                      <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                        {selectedAlert.avgDaysBetweenServices} Days
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Accumulation</div>
                      <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                        {selectedAlert.avgDailyMileage} km/day
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Projected Date</div>
                      <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                        {selectedAlert.estimatedNextServiceDate}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Target Odometer</div>
                      <div className="text-sm font-bold font-mono text-sky-400 mt-0.5">
                        {selectedAlert.estimatedNextServiceMileage.toLocaleString()} km
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                    <span>
                      Recommended Service Focus:{' '}
                      <strong className="text-slate-200">{selectedAlert.recommendedServiceType}</strong>
                    </span>
                    <span className="font-mono text-amber-300">
                      {selectedAlert.daysRemaining < 0
                        ? `${Math.abs(selectedAlert.daysRemaining)} days overdue`
                        : `${selectedAlert.daysRemaining} days remaining`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Historical Service Timeline */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" />
                    <span>Logged Service History Timeline ({selectedCarHistory.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Vehicle ID: {selectedCarId}
                  </span>
                </div>

                {selectedCarHistory.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No historical services logged yet for this vehicle.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCarHistory.map((item) => (
                      <div
                        key={item._id}
                        className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-100">
                                {item.serviceType}
                              </span>
                              <span className="text-[11px] text-slate-500">·</span>
                              <span className="text-[11px] font-mono text-amber-400">
                                {item.serviceDate}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{item.summary}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-xs text-slate-100">
                              ₹{item.cost.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Health score: {item.healthScore}%
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            Technician: <strong className="text-slate-300">{item.mechanicName}</strong>
                          </span>
                          <span className="font-mono">
                            Logged at: {item.mileageAtService.toLocaleString()} km
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              Select a vehicle to inspect health scores and maintenance timelines.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
