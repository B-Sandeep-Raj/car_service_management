import React from 'react';
import {
  Wrench,
  Database,
  RotateCcw,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Package,
  UserCheck,
  Receipt,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export type ActiveModule =
  | 'dashboard'
  | 'customers'
  | 'services'
  | 'inventory'
  | 'mechanics'
  | 'billing'
  | 'predictive';

interface NavbarProps {
  activeModule: ActiveModule;
  setActiveModule: (m: ActiveModule) => void;
  dbStatus: any;
  onResetDb: () => void;
  resetting: boolean;
  activeServicesCount: number;
  lowStockCount: number;
  overdueAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  setActiveModule,
  dbStatus,
  onResetDb,
  resetting,
  activeServicesCount,
  lowStockCount,
  overdueAlertsCount,
}) => {
  const navItems: { id: ActiveModule; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Analytics Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers & Vehicles', icon: <Users className="w-4 h-4" /> },
    {
      id: 'services',
      label: 'Service Booking & Tracking',
      icon: <CalendarCheck className="w-4 h-4" />,
      badge: activeServicesCount,
      badgeColor: 'text-amber-400 bg-amber-950/70 border border-amber-800/60',
    },
    {
      id: 'inventory',
      label: 'Spare Parts & Inventory',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount,
      badgeColor: 'text-rose-400 bg-rose-950/70 border border-rose-800/60',
    },
    { id: 'mechanics', label: 'Mechanic Performance', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing & Invoices', icon: <Receipt className="w-4 h-4" /> },
    {
      id: 'predictive',
      label: 'Service History & Health Alerts',
      icon: <History className="w-4 h-4" />,
      badge: overdueAlertsCount,
      badgeColor: 'text-orange-400 bg-orange-950/70 border border-orange-800/60',
    },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40 text-slate-100">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-100 tracking-tight">
                Car Service Management & Analysis
              </h1>
              <span className="text-xs text-amber-400 font-mono font-medium tracking-wide">
                MongoDB Edition
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Workshop Operations, Aggregation Analytics & Vehicle Health Forecasting
            </p>
          </div>
        </div>

        {/* Database Status & Reset Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">DB:</span>
              <span className="font-medium text-slate-200">
                {dbStatus?.engine || 'Local MongoDB Engine'}
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              7 Collections
            </span>
          </div>

          <button
            onClick={onResetDb}
            disabled={resetting}
            title="Reset database with standard realistic demo records"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-300 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Modules Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 py-1">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
