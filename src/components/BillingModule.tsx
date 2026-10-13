import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  DollarSign,
  CreditCard,
  Building,
  Car as CarIcon,
  User,
  X,
  FileText,
  Trash2,
  Layers
} from 'lucide-react';
import type { Bill, Customer, Car, Service, PaymentStatus, PaymentMethod } from '../types/index';
import { api } from '../services/apiClient';

interface BillingModuleProps {
  bills: Bill[];
  customers: Customer[];
  cars: Car[];
  services: Service[];
  onRefresh: () => void;
}

export const BillingModule: React.FC<BillingModuleProps> = ({
  bills,
  customers,
  cars,
  services,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Printable Invoice Preview Modal
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState<Bill | null>(null);

  // Pay Modal
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI / Bank Transfer');

  // Manual Bill Create Modal
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [newBillServiceId, setNewBillServiceId] = useState('');
  const [newBillParts, setNewBillParts] = useState(3000);
  const [newBillLabor, setNewBillLabor] = useState(1600);
  const [newBillDiscount, setNewBillDiscount] = useState(250);

  const [loading, setLoading] = useState(false);

  // Map lookups
  const customerMap = new Map<string, Customer>();
  customers.forEach((c) => customerMap.set(c._id, c));

  const carMap = new Map<string, Car>();
  cars.forEach((c) => carMap.set(c._id, c));

  const serviceMap = new Map<string, Service>();
  services.forEach((s) => serviceMap.set(s._id, s));

  // Filter bills
  const filteredBills = bills.filter((b) => {
    const matchesStatus = statusFilter === 'All' || b.paymentStatus === statusFilter;
    const cust = customerMap.get(b.customerId);
    const car = carMap.get(b.carId);
    const q = search.toLowerCase();
    const matchesSearch =
      b.billNumber.toLowerCase().includes(q) ||
      b.paymentMethod.toLowerCase().includes(q) ||
      (cust && cust.name.toLowerCase().includes(q)) ||
      (car && car.licensePlate.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const totalCollected = bills
    .filter((b) => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const totalOutstanding = bills
    .filter((b) => b.paymentStatus !== 'Paid')
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const handlePayBill = async () => {
    if (!payingBill) return;
    setLoading(true);
    try {
      await api.payBill(payingBill._id, payMethod);
      setPayingBill(null);
      onRefresh();
    } catch (err: any) {
      alert(`Payment recording error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBillServiceId) return;
    const srv = serviceMap.get(newBillServiceId);
    if (!srv) return;

    setLoading(true);
    try {
      const subtotal = newBillParts + newBillLabor;
      const tax = Math.round(subtotal * 0.18);
      const grandTotal = subtotal + tax - newBillDiscount;

      await api.createBill({
        serviceId: srv._id,
        carId: srv.carId,
        customerId: srv.customerId,
        partsTotal: newBillParts,
        laborTotal: newBillLabor,
        taxAmount: tax,
        discountAmount: newBillDiscount,
        grandTotal,
        paymentStatus: 'Unpaid',
        paymentMethod: 'Card',
      });
      setShowAddBillModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error creating bill: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice record?')) return;
    try {
      await api.deleteBill(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting bill: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Financial Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Revenue Collected</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              ₹{totalCollected.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {bills.filter((b) => b.paymentStatus === 'Paid').length} invoices settled
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Receivables Outstanding</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              ₹{totalOutstanding.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {bills.filter((b) => b.paymentStatus !== 'Paid').length} invoices awaiting payment
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Invoices Issued</div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {bills.length} Bills
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Includes parts, labor & GST breakdown
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            Billing, Invoicing & Workshop Revenue
          </h2>
          <p className="text-xs text-slate-400">
            GST-compliant invoices, automated labor & spare parts reconciliation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice #, customer..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 w-56 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            {['All', 'Paid', 'Partially Paid', 'Unpaid'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === st ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setNewBillServiceId(services[0]?._id || '');
              setShowAddBillModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Bill</span>
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Customer & Vehicle</th>
                <th className="px-4 py-3">Parts Total</th>
                <th className="px-4 py-3">Labor Total</th>
                <th className="px-4 py-3">Tax / Discount</th>
                <th className="px-4 py-3">Grand Total</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No invoices matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const cust = customerMap.get(bill.customerId);
                  const car = carMap.get(bill.carId);
                  const isPaid = bill.paymentStatus === 'Paid';

                  return (
                    <tr key={bill._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-amber-300">{bill.billNumber}</div>
                        <div className="text-[10px] text-slate-500">{new Date(bill.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{cust?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {car?.licensePlate} ({car?.brand} {car?.model})
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        ₹{bill.partsTotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        ₹{bill.laborTotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        <div>+ ₹{bill.taxAmount.toLocaleString()} (GST 18%)</div>
                        <div>- ₹{bill.discountAmount.toLocaleString()} disc</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-slate-100">
                        ₹{bill.grandTotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            isPaid
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                              : bill.paymentStatus === 'Partially Paid'
                              ? 'bg-amber-950/70 text-amber-400 border-amber-800'
                              : 'bg-rose-950/70 text-rose-400 border-rose-800'
                          }`}
                        >
                          {bill.paymentStatus}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          via {bill.paymentMethod}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => setPayingBill(bill)}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Collect Pay
                            </button>
                          )}
                          <button
                            onClick={() => setActiveInvoiceForPrint(bill)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="View & Print Tax Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBill(bill._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Collect Payment for {payingBill.billNumber}
              </h3>
              <button
                onClick={() => setPayingBill(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Total Settlement Due</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  ₹{payingBill.grandTotal.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Payment Method Received
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="UPI / Bank Transfer">UPI / QR Code / Bank Transfer</option>
                  <option value="Card">Credit / Debit Card POS</option>
                  <option value="Cash">Cash at Counter</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingBill(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayBill}
                  disabled={loading}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Recording...' : 'Mark as Fully Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Bill Create Modal */}
      {showAddBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-semibold text-slate-100">
                Generate Manual Workshop Invoice
              </h3>
              <button
                onClick={() => setShowAddBillModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBill} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Source Service Ticket *</label>
                <select
                  required
                  value={newBillServiceId}
                  onChange={(e) => setNewBillServiceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  {services.map((s) => {
                    const car = carMap.get(s.carId);
                    return (
                      <option key={s._id} value={s._id}>
                        {s._id} - {car?.licensePlate} ({s.serviceType})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Spare Parts Total (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newBillParts}
                    onChange={(e) => setNewBillParts(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Labor Total (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newBillLabor}
                    onChange={(e) => setNewBillLabor(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Discount Amount (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={newBillDiscount}
                  onChange={(e) => setNewBillDiscount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>₹{(newBillParts + newBillLabor).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (18%):</span>
                  <span>₹{Math.round((newBillParts + newBillLabor) * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-100 font-bold border-t border-slate-800 pt-1">
                  <span>Estimated Grand Total:</span>
                  <span className="text-amber-400">
                    ₹{(
                      newBillParts +
                      newBillLabor +
                      Math.round((newBillParts + newBillLabor) * 0.18) -
                      newBillDiscount
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBillModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-slate-950 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Issuing...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Tax Invoice Printable Preview Modal */}
      {activeInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-xl max-w-2xl w-full p-8 shadow-2xl max-h-[95vh] overflow-y-auto">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Workshop Tax Invoice Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setActiveInvoiceForPrint(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Body */}
            <div>
              {/* Header */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    PRECISION MOTORS CAR SERVICE
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized Automotive Diagnostics, Repair & Maintenance Center
                  </p>
                  <p className="text-xs text-slate-500">
                    GSTIN: 29AAACP9012K1Z9 · Central Workshop Hub, Bengaluru
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {activeInvoiceForPrint.billNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Date: {new Date(activeInvoiceForPrint.createdAt).toLocaleDateString()}
                  </div>
                  <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                    activeInvoiceForPrint.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeInvoiceForPrint.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Customer & Vehicle Info */}
              {(() => {
                const cust = customerMap.get(activeInvoiceForPrint.customerId);
                const car = carMap.get(activeInvoiceForPrint.carId);
                const srv = serviceMap.get(activeInvoiceForPrint.serviceId);

                return (
                  <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-200 text-xs">
                    <div>
                      <div className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider mb-1">
                        Billed To
                      </div>
                      <div className="font-bold text-slate-900">{cust?.name}</div>
                      <div className="text-slate-600">{cust?.phone}</div>
                      <div className="text-slate-600">{cust?.email}</div>
                      <div className="text-slate-600">{cust?.address}</div>
                      <div className="text-slate-500 text-[10px] mt-1">Tier: {cust?.membershipTier}</div>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider mb-1">
                        Vehicle Serviced
                      </div>
                      <div className="font-bold font-mono text-slate-900 text-sm">
                        {car?.licensePlate}
                      </div>
                      <div className="text-slate-600">
                        {car?.brand} {car?.model} ({car?.year})
                      </div>
                      <div className="text-slate-600 font-mono text-[11px]">
                        VIN: {car?.vin}
                      </div>
                      <div className="text-slate-600">
                        Mileage: {car?.mileage.toLocaleString()} km · {car?.fuelType}
                      </div>
                      {srv && (
                        <div className="text-slate-700 font-medium mt-1">
                          Service: {srv.serviceType}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Line Items Table */}
              <div className="py-4">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="py-2">Description</th>
                      <th className="py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5">
                        <div className="font-medium text-slate-800">Automotive Spare Parts & Consumables</div>
                        <div className="text-[11px] text-slate-500">
                          OEM filters, brake components, fluids and engine parts
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium">
                        ₹{activeInvoiceForPrint.partsTotal.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <div className="font-medium text-slate-800">Technician Diagnostic & Labor Charges</div>
                        <div className="text-[11px] text-slate-500">
                          Bay service, sensor calibration and physical testing
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium">
                        ₹{activeInvoiceForPrint.laborTotal.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Totals */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono">
                      ₹{(activeInvoiceForPrint.partsTotal + activeInvoiceForPrint.laborTotal).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (CGST 9% + SGST 9%):</span>
                    <span className="font-mono">₹{activeInvoiceForPrint.taxAmount.toLocaleString()}</span>
                  </div>
                  {activeInvoiceForPrint.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Membership / Promotional Discount:</span>
                      <span className="font-mono">- ₹{activeInvoiceForPrint.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-300 pt-2">
                    <span>Grand Total:</span>
                    <span className="font-mono text-base">
                      ₹{activeInvoiceForPrint.grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 text-right pt-1">
                    Settlement Mode: {activeInvoiceForPrint.paymentMethod}
                  </div>
                </div>
              </div>

              {/* Signatures & Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <p>1. Warranty: 6 months or 10,000 km on OEM spare parts installed.</p>
                  <p>2. Computer generated tax invoice; no signature required.</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span>Authorized Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
