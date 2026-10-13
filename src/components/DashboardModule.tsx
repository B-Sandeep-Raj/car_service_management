import React, { useState } from 'react';
import {
  Bar,
  Line,
  Doughnut,
} from 'react-chartjs-2';
import './chartSetup';
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Code2,
  TrendingUp,
  Car,
  Wrench,
  Package,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import type { AggregationPipelineDoc } from '../types/index';

interface DashboardModuleProps {
  aggregations: AggregationPipelineDoc[];
  onOpenInspector: (pipelineKey?: string) => void;
  onNavigateModule: (mod: string) => void;
  servicesCount: number;
  lowStockCount: number;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  aggregations,
  onOpenInspector,
  onNavigateModule,
  servicesCount,
  lowStockCount,
}) => {
  // Helper to extract pipeline data
  const getPipeData = (key: string) => {
    const found = aggregations.find((p) => p.key === key);
    return found?.data || [];
  };

  const overviewData = getPipeData('totalCompletedServices')[0] || {
    totalCompletedServices: 12,
    totalRevenue: 78900,
    avgCost: 6575,
    avgLaborHours: 2.5,
  };

  // 1. Monthly Revenue & Volume Chart
  const monthlyData = getPipeData('monthlyRevenueAndVolume');
  const monthlyChartConfig = {
    labels: monthlyData.map((d: any) => d.month || d._id),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Monthly Revenue (₹)',
        data: monthlyData.map((d: any) => d.totalRevenue),
        backgroundColor: 'rgba(245, 158, 11, 0.85)', // Amber 500
        hoverBackgroundColor: 'rgba(251, 191, 36, 1)',
        borderRadius: 4,
        yAxisID: 'yRevenue',
      },
      {
        type: 'line' as const,
        label: 'Services Billed',
        data: monthlyData.map((d: any) => d.totalBills),
        borderColor: '#38bdf8', // Sky 400
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#38bdf8',
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'yCount',
      },
    ],
  };

  const monthlyChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, color: '#cbd5e1' } },
    },
    scales: {
      x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8' } },
      yRevenue: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: {
          color: '#f59e0b',
          callback: (value: any) => `₹${Number(value).toLocaleString()}`,
        },
      },
      yCount: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#38bdf8', stepSize: 1 },
      },
    },
  };

  // 2. Common Service Types Chart
  const serviceTypesData = getPipeData('commonServiceTypes');
  const serviceTypesChartConfig = {
    labels: serviceTypesData.map((d: any) => d.serviceType || d._id),
    datasets: [
      {
        data: serviceTypesData.map((d: any) => d.count),
        backgroundColor: [
          '#f59e0b', // amber
          '#38bdf8', // sky
          '#10b981', // emerald
          '#818cf8', // indigo
          '#f43f5e', // rose
          '#fb923c', // orange
          '#a855f7', // purple
          '#06b6d4', // cyan
        ],
        borderWidth: 1,
        borderColor: '#0f172a',
      },
    ],
  };

  // 3. Frequently Serviced Brands Chart
  const brandsData = getPipeData('frequentlyServicedBrands');
  const brandsChartConfig = {
    labels: brandsData.map((d: any) => d.brand || d._id),
    datasets: [
      {
        label: 'Services Logged',
        data: brandsData.map((d: any) => d.serviceCount),
        backgroundColor: 'rgba(56, 189, 248, 0.85)',
        borderRadius: 4,
      },
    ],
  };

  const horizontalBarOptions: any = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { stepSize: 1, color: '#94a3b8' } },
      y: { grid: { display: false }, ticks: { color: '#cbd5e1' } },
    },
  };

  // 4. Mechanic Performance Chart
  const mechanicsData = getPipeData('mechanicPerformance');
  const mechanicsChartConfig = {
    labels: mechanicsData.map((d: any) => d.mechanicName || d._id),
    datasets: [
      {
        label: 'Completed Jobs',
        data: mechanicsData.map((d: any) => d.completedJobs),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Total Labor Hours',
        data: mechanicsData.map((d: any) => d.totalLaborHours),
        backgroundColor: '#f59e0b',
        borderRadius: 4,
      },
    ],
  };

  // 5. Spare Parts Demand Chart
  const partsData = getPipeData('sparePartsDemand');
  const partsChartConfig = {
    labels: partsData.slice(0, 7).map((d: any) => d.partName || d._id),
    datasets: [
      {
        label: 'Units Consumed',
        data: partsData.slice(0, 7).map((d: any) => d.totalUnitsUsed),
        backgroundColor: 'rgba(244, 63, 94, 0.85)', // Rose 500
        borderRadius: 4,
      },
    ],
  };

  // 6. Service Status Pipeline Chart
  const statusData = getPipeData('serviceStatusPipeline');
  const statusChartConfig = {
    labels: statusData.map((d: any) => d.status || d._id),
    datasets: [
      {
        data: statusData.map((d: any) => d.count),
        backgroundColor: [
          '#10b981', // Completed (green)
          '#f59e0b', // In Progress (amber)
          '#38bdf8', // Pending (sky)
          '#f97316', // Awaiting Parts (orange)
          '#64748b', // Cancelled (slate)
        ],
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with MongoDB Aggregation badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              MongoDB Analytical Engine
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">Aggregation Framework v6.0+</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-0.5">
            Workshop Performance & Financial Intelligence
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-collection aggregations ($match, $lookup, $unwind, $group, $sort, $project)
          </p>
        </div>

        <button
          onClick={() => onOpenInspector()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors cursor-pointer"
        >
          <Code2 className="w-4 h-4" />
          <span>Inspect All 9 MongoDB Aggregation Pipelines</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Billed Revenue</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 font-mono">
              ₹{(overviewData.totalRevenue || 78900).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <span>Avg ₹{(overviewData.avgCost || 6575).toLocaleString()} / service</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Completed Services</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 font-mono">
              {overviewData.totalCompletedServices || 12}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <span>Avg {overviewData.avgLaborHours || 2.5} labor hours</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active In-Shop Workload</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 font-mono">
              {servicesCount}
            </div>
            <button
              onClick={() => onNavigateModule('services')}
              className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 mt-1 cursor-pointer"
            >
              <span>View workflow board</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Inventory Stock Alerts</span>
            <div className={`p-1.5 rounded-lg ${lowStockCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold font-mono ${lowStockCount > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
              {lowStockCount} Parts
            </div>
            <button
              onClick={() => onNavigateModule('inventory')}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 mt-1 cursor-pointer"
            >
              <span>Restock needed items</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Chart.js Dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Revenue & Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Monthly Revenue & Service Volume
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pipeline: $lookup Bills → $project monthYear → $group
              </p>
            </div>
            <button
              onClick={() => onOpenInspector('monthlyRevenueAndVolume')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Inspect Pipeline Query"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>
          <div className="h-64 w-full">
            <Bar data={monthlyChartConfig as any} options={monthlyChartOptions} />
          </div>
        </div>

        {/* Chart 2: Common Service Types */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Service Categories Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pipeline: $group by serviceType → $sum count
              </p>
            </div>
            <button
              onClick={() => onOpenInspector('commonServiceTypes')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Inspect Pipeline Query"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <Doughnut
              data={serviceTypesChartConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { boxWidth: 10, color: '#cbd5e1' } },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 3: Frequently Serviced Car Brands */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Car className="w-4 h-4 text-sky-400" />
                Frequently Serviced Vehicle Brands
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pipeline: $lookup Cars → $unwind → $group by brand → $sort
              </p>
            </div>
            <button
              onClick={() => onOpenInspector('frequentlyServicedBrands')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Inspect Pipeline Query"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>
          <div className="h-64 w-full">
            <Bar data={brandsChartConfig} options={horizontalBarOptions} />
          </div>
        </div>

        {/* Chart 4: Mechanic Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                Mechanic Output & Labor Hours
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pipeline: $lookup Mechanics → $group by mechanicId
              </p>
            </div>
            <button
              onClick={() => onOpenInspector('mechanicPerformance')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Inspect Pipeline Query"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>
          <div className="h-64 w-full">
            <Bar
              data={mechanicsChartConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { boxWidth: 10, color: '#cbd5e1' } },
                },
                scales: {
                  x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#cbd5e1' } },
                  y: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8' } },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 5: Spare Parts Consumption */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-rose-400" />
                High Demand Spare Parts (Units Consumed)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pipeline: $unwind partsUsed → $group by partName → $sort
              </p>
            </div>
            <button
              onClick={() => onOpenInspector('sparePartsDemand')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Inspect Pipeline Query"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>
          <div className="h-64 w-full">
            <Bar
              data={partsChartConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    grid: { color: 'rgba(51, 65, 85, 0.3)' },
                    ticks: {
                      color: '#cbd5e1',
                      maxRotation: 25,
                      minRotation: 15,
                    },
                  },
                  y: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8' } },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 6: Service Status Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Workshop Job Queue Status Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pipeline: $group by status → $sum count
              </p>
            </div>
            <button
              onClick={() => onOpenInspector('serviceStatusPipeline')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Inspect Pipeline Query"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <Doughnut
              data={statusChartConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { boxWidth: 10, color: '#cbd5e1' } },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
