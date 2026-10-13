import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  Tag,
  Boxes,
  CheckCircle2
} from 'lucide-react';
import type { SparePart, PartCategory } from '../types/index';
import { api } from '../services/apiClient';

interface InventoryModuleProps {
  spareParts: SparePart[];
  onRefresh: () => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({ spareParts, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [restockingPart, setRestockingPart] = useState<SparePart | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // Form State
  const [partForm, setPartForm] = useState({
    partNumber: '',
    name: '',
    category: 'Filters' as PartCategory,
    costPrice: 500,
    sellingPrice: 850,
    stockQuantity: 20,
    minimumStockLevel: 5,
    unit: 'Piece',
    supplier: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const categories: PartCategory[] = [
    'Brakes',
    'Filters',
    'Engine',
    'Transmission',
    'Fluids',
    'Electrical',
    'Tires',
    'Suspension',
  ];

  // Filtering
  const filteredParts = spareParts.filter((part) => {
    const matchesCategory = selectedCategory === 'All' || part.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || part.stockQuantity <= part.minimumStockLevel;
    const q = search.toLowerCase();
    const matchesSearch =
      part.name.toLowerCase().includes(q) ||
      part.partNumber.toLowerCase().includes(q) ||
      part.supplier.toLowerCase().includes(q);

    return matchesCategory && matchesLowStock && matchesSearch;
  });

  const lowStockCount = spareParts.filter((p) => p.stockQuantity <= p.minimumStockLevel).length;
  const totalInventoryValue = spareParts.reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0);

  const handleOpenAdd = () => {
    setEditingPart(null);
    setPartForm({
      partNumber: `PT-${Date.now().toString().slice(-5)}`,
      name: '',
      category: 'Filters',
      costPrice: 500,
      sellingPrice: 850,
      stockQuantity: 20,
      minimumStockLevel: 5,
      unit: 'Piece',
      supplier: 'Bosch Automotive',
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (part: SparePart) => {
    setEditingPart(part);
    setPartForm({
      partNumber: part.partNumber,
      name: part.name,
      category: part.category,
      costPrice: part.costPrice,
      sellingPrice: part.sellingPrice,
      stockQuantity: part.stockQuantity,
      minimumStockLevel: part.minimumStockLevel,
      unit: part.unit,
      supplier: part.supplier,
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSavePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partForm.partNumber.trim() || !partForm.name.trim()) {
      setFormError('Part Number and Name are required.');
      return;
    }
    setLoading(true);
    try {
      if (editingPart) {
        await api.updateSparePart(editingPart._id, partForm);
        setToast('Spare part updated successfully.');
      } else {
        await api.createSparePart(partForm);
        setToast('New spare part cataloged in inventory.');
      }
      setShowAddModal(false);
      onRefresh();
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      setFormError(err.message || 'Error saving spare part');
    } finally {
      setLoading(false);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockingPart) return;
    setLoading(true);
    try {
      await api.updateStock(restockingPart._id, restockAmount);
      setToast(`Restocked ${restockAmount} units of ${restockingPart.name}.`);
      setRestockingPart(null);
      onRefresh();
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      alert(`Restock error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePart = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from inventory catalog?`)) return;
    try {
      await api.deleteSparePart(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toast && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Catalog Items</div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{spareParts.length} SKUs</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Low Stock Reorder Alerts</div>
            <div className={`text-2xl font-bold font-mono mt-1 ${lowStockCount > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
              {lowStockCount} Parts
            </div>
          </div>
          <div className={`p-2 rounded-lg ${lowStockCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Stock Cost Value</div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">₹{totalInventoryValue.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            Spare Parts Catalog & Inventory Control
          </h2>
          <p className="text-xs text-slate-400">
            Real-time stock level tracking, automated parts usage deduction, and reorder warnings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search part name, SKU, vendor..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 w-56 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showLowStockOnly
                ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Only ({lowStockCount})</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Part</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Parts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Part Details & SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock Level</th>
                <th className="px-4 py-3">Cost Price</th>
                <th className="px-4 py-3">Selling Price</th>
                <th className="px-4 py-3">Margin</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No spare parts found for this category and search filter.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLow = part.stockQuantity <= part.minimumStockLevel;
                  const marginPct =
                    part.sellingPrice > 0
                      ? Math.round(((part.sellingPrice - part.costPrice) / part.sellingPrice) * 100)
                      : 0;

                  return (
                    <tr key={part._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100">{part.name}</div>
                        <div className="font-mono text-[11px] text-amber-400">{part.partNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {part.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLow ? 'text-rose-400' : 'text-slate-100'}`}>
                            {part.stockQuantity} {part.unit}s
                          </span>
                          {isLow && (
                            <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800 px-1.5 py-0.2 rounded font-sans font-medium">
                              Low (Min: {part.minimumStockLevel})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        ₹{part.costPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">
                        ₹{part.sellingPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className="text-sky-400">{marginPct}%</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {part.supplier}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setRestockingPart(part);
                              setRestockAmount(10);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-medium transition-colors cursor-pointer mr-1"
                            title="Restock units"
                          >
                            + Stock
                          </button>
                          <button
                            onClick={() => handleOpenEdit(part)}
                            className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePart(part._id, part.name)}
                            className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                            title="Delete"
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

      {/* Quick Restock Modal */}
      {restockingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="text-sm font-semibold text-slate-100">
                Restock Spare Part
              </h3>
              <button
                onClick={() => setRestockingPart(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <div className="text-xs font-medium text-slate-100">{restockingPart.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Current Stock: {restockingPart.stockQuantity} {restockingPart.unit}s
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Add Stock Quantity ({restockingPart.unit}s)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRestockingPart(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold cursor-pointer"
                >
                  {loading ? 'Updating...' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Part Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-semibold text-slate-100">
                {editingPart ? 'Edit Spare Part' : 'Catalog New Spare Part'}
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

            <form onSubmit={handleSavePart} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Part SKU / Number *</label>
                  <input
                    type="text"
                    required
                    value={partForm.partNumber}
                    onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })}
                    placeholder="e.g. BP-FR-022"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                  <select
                    value={partForm.category}
                    onChange={(e) => setPartForm({ ...partForm, category: e.target.value as PartCategory })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Part Description / Name *</label>
                <input
                  type="text"
                  required
                  value={partForm.name}
                  onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                  placeholder="e.g. Premium Semi-Metallic Brake Pads"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={partForm.costPrice}
                    onChange={(e) => setPartForm({ ...partForm, costPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={partForm.sellingPrice}
                    onChange={(e) => setPartForm({ ...partForm, sellingPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={partForm.stockQuantity}
                    onChange={(e) => setPartForm({ ...partForm, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min={1}
                    value={partForm.minimumStockLevel}
                    onChange={(e) => setPartForm({ ...partForm, minimumStockLevel: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={partForm.unit}
                    onChange={(e) => setPartForm({ ...partForm, unit: e.target.value })}
                    placeholder="Piece, Set, Can"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Supplier / Manufacturer</label>
                <input
                  type="text"
                  value={partForm.supplier}
                  onChange={(e) => setPartForm({ ...partForm, supplier: e.target.value })}
                  placeholder="e.g. Bosch, Brembo, Mann-Filter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
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
                  {loading ? 'Saving...' : editingPart ? 'Update Part' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
