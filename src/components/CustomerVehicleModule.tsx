import React, { useState } from 'react';
import {
  Users,
  Car as CarIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  CalendarCheck,
  Shield,
  Phone,
  Mail,
  MapPin,
  Fuel,
  Gauge,
  X,
  CheckCircle2
} from 'lucide-react';
import type { Customer, Car, MembershipTier, FuelType } from '../types/index';
import { api } from '../services/apiClient';

interface CustomerVehicleModuleProps {
  customers: Customer[];
  cars: Car[];
  onRefresh: () => void;
  onBookServiceForCar: (car: Car) => void;
}

export const CustomerVehicleModule: React.FC<CustomerVehicleModuleProps> = ({
  customers,
  cars,
  onRefresh,
  onBookServiceForCar,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Modals state
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [preselectedCustomerForCar, setPreselectedCustomerForCar] = useState<string>('');

  // Form states
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    membershipTier: 'Standard' as MembershipTier,
  });

  const [carForm, setCarForm] = useState({
    customerId: '',
    licensePlate: '',
    brand: '',
    model: '',
    year: 2022,
    vin: '',
    fuelType: 'Petrol' as FuelType,
    mileage: 35000,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter customers
  const filteredCustomers = customers.filter((cust) => {
    const matchesTier = selectedTier === 'All' || cust.membershipTier === selectedTier;
    const q = search.toLowerCase();
    const customerCars = cars.filter((c) => c.customerId === cust._id);
    const matchesCars = customerCars.some(
      (c) =>
        c.licensePlate.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.vin.toLowerCase().includes(q)
    );
    const matchesCust =
      cust.name.toLowerCase().includes(q) ||
      cust.phone.toLowerCase().includes(q) ||
      cust.email.toLowerCase().includes(q) ||
      cust.address.toLowerCase().includes(q);

    return matchesTier && (matchesCust || matchesCars);
  });

  // Handlers for Customer
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      membershipTier: 'Standard',
    });
    setFormError(null);
    setShowAddCustomerModal(true);
  };

  const handleOpenEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust);
    setCustomerForm({
      name: cust.name,
      phone: cust.phone,
      email: cust.email,
      address: cust.address,
      membershipTier: cust.membershipTier,
    });
    setFormError(null);
    setShowAddCustomerModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim() || !customerForm.phone.trim() || !customerForm.email.trim()) {
      setFormError('Please fill in Name, Phone, and Email.');
      return;
    }
    setLoading(true);
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer._id, customerForm);
      } else {
        await api.createCustomer(customerForm);
      }
      setShowAddCustomerModal(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}" and unregister their vehicles?`)) return;
    try {
      await api.deleteCustomer(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  // Handlers for Car
  const handleOpenAddCar = (customerId?: string) => {
    setEditingCar(null);
    setCarForm({
      customerId: customerId || customers[0]?._id || '',
      licensePlate: '',
      brand: 'Toyota',
      model: '',
      year: 2022,
      vin: '',
      fuelType: 'Petrol',
      mileage: 30000,
    });
    setFormError(null);
    setShowAddCarModal(true);
  };

  const handleOpenEditCar = (car: Car) => {
    setEditingCar(car);
    setCarForm({
      customerId: car.customerId,
      licensePlate: car.licensePlate,
      brand: car.brand,
      model: car.model,
      year: car.year,
      vin: car.vin,
      fuelType: car.fuelType,
      mileage: car.mileage,
    });
    setFormError(null);
    setShowAddCarModal(true);
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carForm.licensePlate.trim() || !carForm.brand.trim() || !carForm.model.trim()) {
      setFormError('License Plate, Brand, and Model are required.');
      return;
    }
    setLoading(true);
    try {
      if (editingCar) {
        await api.updateCar(editingCar._id, carForm);
      } else {
        await api.createCar(carForm);
      }
      setShowAddCarModal(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (id: string, plate: string) => {
    if (!confirm(`Are you sure you want to remove vehicle "${plate}"?`)) return;
    try {
      await api.deleteCar(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting vehicle: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Action Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Customer & Vehicle Fleet Directory
          </h2>
          <p className="text-xs text-slate-400">
            {customers.length} registered customers · {cars.length} active vehicles in database
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
              placeholder="Search customer, phone, plate, VIN..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 w-64 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Membership Tier Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            {['All', 'Standard', 'Premium', 'VIP'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedTier === tier
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenAddCustomer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customers & Vehicles List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm">
            No customers or vehicles matching your search criteria.
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const customerCars = cars.filter((c) => c.customerId === customer._id);
            return (
              <div
                key={customer._id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                {/* Customer Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-sm">
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-100">{customer.name}</h3>
                        <span className="text-xs font-mono text-slate-500">({customer._id})</span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                          customer.membershipTier === 'VIP'
                            ? 'text-amber-400 bg-amber-950/60 border-amber-800/80'
                            : customer.membershipTier === 'Premium'
                            ? 'text-sky-400 bg-sky-950/60 border-sky-800/80'
                            : 'text-slate-400 bg-slate-800 border-slate-700'
                        }`}>
                          {customer.membershipTier} Member
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {customer.phone}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {customer.email}
                        </span>
                        {customer.address && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 truncate max-w-xs">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {customer.address}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddCar(customer._id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Register Car</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditCustomer(customer)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer._id, customer.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Linked Vehicles Sub-Cards */}
                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CarIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Registered Vehicles ({customerCars.length})</span>
                  </div>

                  {customerCars.length === 0 ? (
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-500 text-center">
                      No vehicles registered yet. Click &quot;Register Car&quot; to link a vehicle to this customer.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {customerCars.map((car) => (
                        <div
                          key={car._id}
                          className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-mono font-bold text-xs text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
                                  {car.licensePlate}
                                </span>
                                <h4 className="text-xs font-semibold text-slate-200 mt-1.5">
                                  {car.brand} {car.model} ({car.year})
                                </h4>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditCar(car)}
                                  className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                                  title="Edit Car"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCar(car._id, car.licensePlate)}
                                  className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                                  title="Delete Car"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2.5 space-y-1 text-[11px] text-slate-400">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Fuel className="w-3 h-3 text-slate-500" />
                                  Fuel: {car.fuelType}
                                </span>
                                <span className="flex items-center gap-1 font-mono">
                                  <Gauge className="w-3 h-3 text-slate-500" />
                                  {car.mileage.toLocaleString()} km
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate">
                                VIN: {car.vin}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">ID: {car._id}</span>
                            <button
                              onClick={() => onBookServiceForCar(car)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-medium text-amber-300 transition-colors cursor-pointer"
                            >
                              <CalendarCheck className="w-3 h-3" />
                              <span>Book Service</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-semibold text-slate-100">
                {editingCustomer ? 'Edit Customer' : 'Register New Customer'}
              </h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
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

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Narayan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="Street, Locality, City"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Membership Tier</label>
                <select
                  value={customerForm.membershipTier}
                  onChange={(e) => setCustomerForm({ ...customerForm, membershipTier: e.target.value as MembershipTier })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Standard">Standard Tier (Standard Rates)</option>
                  <option value="Premium">Premium Tier (5% Parts Discount)</option>
                  <option value="VIP">VIP Tier (Priority Bay & 10% Discount)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-slate-950 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Car Modal */}
      {showAddCarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-semibold text-slate-100">
                {editingCar ? 'Edit Vehicle Record' : 'Register Vehicle to Customer'}
              </h3>
              <button
                onClick={() => setShowAddCarModal(false)}
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

            <form onSubmit={handleSaveCar} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Owner / Customer *</label>
                <select
                  required
                  value={carForm.customerId}
                  onChange={(e) => setCarForm({ ...carForm, customerId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone}) - {c.membershipTier}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">License Plate *</label>
                  <input
                    type="text"
                    required
                    value={carForm.licensePlate}
                    onChange={(e) => setCarForm({ ...carForm, licensePlate: e.target.value })}
                    placeholder="KA 01 AB 1234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Make / Brand *</label>
                  <input
                    type="text"
                    required
                    value={carForm.brand}
                    onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })}
                    placeholder="e.g. Toyota"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={carForm.model}
                    onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                    placeholder="e.g. Innova Crysta"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Model Year</label>
                  <input
                    type="number"
                    min={1990}
                    max={2026}
                    value={carForm.year}
                    onChange={(e) => setCarForm({ ...carForm, year: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fuel Type</label>
                  <select
                    value={carForm.fuelType}
                    onChange={(e) => setCarForm({ ...carForm, fuelType: e.target.value as FuelType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Odometer (km)</label>
                  <input
                    type="number"
                    min={0}
                    value={carForm.mileage}
                    onChange={(e) => setCarForm({ ...carForm, mileage: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">VIN / Chassis No.</label>
                  <input
                    type="text"
                    value={carForm.vin}
                    onChange={(e) => setCarForm({ ...carForm, vin: e.target.value })}
                    placeholder="17-char VIN"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCarModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-slate-950 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCar ? 'Update Vehicle' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
