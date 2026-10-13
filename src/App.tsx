import React, { useEffect, useState } from 'react';
import { Navbar, ActiveModule } from './components/Navbar';
import { DashboardModule } from './components/DashboardModule';
import { CustomerVehicleModule } from './components/CustomerVehicleModule';
import { ServiceBookingModule } from './components/ServiceBookingModule';
import { InventoryModule } from './components/InventoryModule';
import { MechanicModule } from './components/MechanicModule';
import { BillingModule } from './components/BillingModule';
import { ServiceHistoryModule } from './components/ServiceHistoryModule';
import { AggregationInspectorModal } from './components/AggregationInspectorModal';
import { api } from './services/apiClient';
import type {
  Customer,
  Car,
  Service,
  Mechanic,
  SparePart,
  Bill,
  ServiceHistoryItem,
  PredictiveAlert,
  AggregationPipelineDoc,
} from './types/index';
import { AlertTriangle, RefreshCw, Database } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

  // Application Data States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [aggregations, setAggregations] = useState<AggregationPipelineDoc[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Cross-module interaction states
  const [preselectedCarForBooking, setPreselectedCarForBooking] = useState<Car | null>(null);

  // Inspector modal state
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorSelectedKey, setInspectorSelectedKey] = useState<string | undefined>(undefined);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = async () => {
    try {
      setError(null);
      const [
        statusRes,
        custRes,
        carsRes,
        srvRes,
        mechRes,
        partsRes,
        billsRes,
        histRes,
        alertsRes,
        aggRes,
      ] = await Promise.all([
        api.getDbStatus(),
        api.getCustomers(),
        api.getCars(),
        api.getServices(),
        api.getMechanics(),
        api.getSpareParts(),
        api.getBills(),
        api.getServiceHistory(),
        api.getPredictiveAlerts(),
        api.getAggregations(),
      ]);

      setDbStatus(statusRes);
      setCustomers(custRes);
      setCars(carsRes);
      setServices(srvRes);
      setMechanics(mechRes);
      setSpareParts(partsRes);
      setBills(billsRes);
      setHistory(histRes);
      setPredictiveAlerts(alertsRes);
      setAggregations(aggRes);
    } catch (err: any) {
      console.error('Data load error:', err);
      setError(err.message || 'Failed to connect to local backend service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleResetDatabase = async () => {
    if (!confirm('Reset local database to initial realistic demo records? All 7 collections will be restored.')) return;
    setResetting(true);
    try {
      await api.resetDatabase();
      await loadAllData();
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const handleBookServiceForCar = (car: Car) => {
    setPreselectedCarForBooking(car);
    setActiveModule('services');
  };

  const handleOpenInspector = (pipelineKey?: string) => {
    setInspectorSelectedKey(pipelineKey);
    setIsInspectorOpen(true);
  };

  // Badge calculations
  const activeServicesCount = services.filter((s) => s.status !== 'Completed' && s.status !== 'Cancelled').length;
  const lowStockCount = spareParts.filter((p) => p.stockQuantity <= p.minimumStockLevel).length;
  const overdueAlertsCount = predictiveAlerts.filter((a) => a.alertLevel === 'Overdue').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        dbStatus={dbStatus}
        onResetDb={handleResetDatabase}
        resetting={resetting}
        activeServicesCount={activeServicesCount}
        lowStockCount={lowStockCount}
        overdueAlertsCount={overdueAlertsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="p-4 mb-6 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                loadAllData();
              }}
              className="flex items-center gap-1 px-3 py-1 bg-rose-900 hover:bg-rose-800 rounded font-medium text-white cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400 font-mono">
              Initializing MongoDB Collections & Aggregations...
            </p>
          </div>
        ) : (
          <>
            {activeModule === 'dashboard' && (
              <DashboardModule
                aggregations={aggregations}
                onOpenInspector={handleOpenInspector}
                onNavigateModule={(mod) => setActiveModule(mod as ActiveModule)}
                servicesCount={activeServicesCount}
                lowStockCount={lowStockCount}
              />
            )}

            {activeModule === 'customers' && (
              <CustomerVehicleModule
                customers={customers}
                cars={cars}
                onRefresh={loadAllData}
                onBookServiceForCar={handleBookServiceForCar}
              />
            )}

            {activeModule === 'services' && (
              <ServiceBookingModule
                services={services}
                cars={cars}
                customers={customers}
                mechanics={mechanics}
                spareParts={spareParts}
                onRefresh={loadAllData}
                preselectedCar={preselectedCarForBooking}
                onClearPreselectedCar={() => setPreselectedCarForBooking(null)}
              />
            )}

            {activeModule === 'inventory' && (
              <InventoryModule
                spareParts={spareParts}
                onRefresh={loadAllData}
              />
            )}

            {activeModule === 'mechanics' && (
              <MechanicModule
                mechanics={mechanics}
                services={services}
                onRefresh={loadAllData}
              />
            )}

            {activeModule === 'billing' && (
              <BillingModule
                bills={bills}
                customers={customers}
                cars={cars}
                services={services}
                onRefresh={loadAllData}
              />
            )}

            {activeModule === 'predictive' && (
              <ServiceHistoryModule
                history={history}
                predictiveAlerts={predictiveAlerts}
                cars={cars}
                customers={customers}
                onRefresh={loadAllData}
                onBookService={handleBookServiceForCar}
              />
            )}
          </>
        )}
      </main>

      {/* Aggregation Inspector Modal */}
      <AggregationInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        pipelines={aggregations}
        initialSelectedKey={inspectorSelectedKey}
      />

      {/* Clean Technical Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Car Service Management & Analysis</span>
            <span aria-hidden="true">·</span>
            <span>MongoDB Schema & Aggregation Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Collections: 7</span>
            <span>Pipelines: 9</span>
            <span>Health Scoring: Explainable Arithmetic (Non-ML)</span>
            <button
              onClick={() => handleOpenInspector()}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Aggregation Sandbox
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
