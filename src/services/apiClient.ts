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
} from '../types/index';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Database status & reset
  getDbStatus: () => fetchJson<any>('/db-status'),
  resetDatabase: () => fetchJson<{ message: string; success: boolean }>('/db-reset', { method: 'POST' }),

  // Customers
  getCustomers: (params?: { search?: string; tier?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.tier) q.append('tier', params.tier);
    return fetchJson<Customer[]>(`/customers?${q.toString()}`);
  },
  createCustomer: (data: Partial<Customer>) =>
    fetchJson<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: Partial<Customer>) =>
    fetchJson<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) =>
    fetchJson<{ message: string }>(`/customers/${id}`, { method: 'DELETE' }),

  // Cars
  getCars: (params?: { search?: string; customerId?: string; brand?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.customerId) q.append('customerId', params.customerId);
    if (params?.brand) q.append('brand', params.brand);
    return fetchJson<Car[]>(`/cars?${q.toString()}`);
  },
  createCar: (data: Partial<Car>) =>
    fetchJson<Car>('/cars', { method: 'POST', body: JSON.stringify(data) }),
  updateCar: (id: string, data: Partial<Car>) =>
    fetchJson<Car>(`/cars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCar: (id: string) =>
    fetchJson<{ message: string }>(`/cars/${id}`, { method: 'DELETE' }),

  // Services
  getServices: (params?: { status?: string; priority?: string; carId?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.priority) q.append('priority', params.priority);
    if (params?.carId) q.append('carId', params.carId);
    return fetchJson<Service[]>(`/services?${q.toString()}`);
  },
  createService: (data: Partial<Service>) =>
    fetchJson<Service>('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id: string, data: Partial<Service>) =>
    fetchJson<Service>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateServiceStatus: (id: string, status: string) =>
    fetchJson<Service>(`/services/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteService: (id: string) =>
    fetchJson<{ message: string }>(`/services/${id}`, { method: 'DELETE' }),

  // Mechanics
  getMechanics: () => fetchJson<Mechanic[]>('/mechanics'),
  createMechanic: (data: Partial<Mechanic>) =>
    fetchJson<Mechanic>('/mechanics', { method: 'POST', body: JSON.stringify(data) }),
  updateMechanic: (id: string, data: Partial<Mechanic>) =>
    fetchJson<Mechanic>(`/mechanics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMechanic: (id: string) =>
    fetchJson<{ message: string }>(`/mechanics/${id}`, { method: 'DELETE' }),

  // Spare Parts
  getSpareParts: (params?: { category?: string; lowStock?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.lowStock) q.append('lowStock', 'true');
    if (params?.search) q.append('search', params.search);
    return fetchJson<SparePart[]>(`/spare-parts?${q.toString()}`);
  },
  createSparePart: (data: Partial<SparePart>) =>
    fetchJson<SparePart>('/spare-parts', { method: 'POST', body: JSON.stringify(data) }),
  updateSparePart: (id: string, data: Partial<SparePart>) =>
    fetchJson<SparePart>(`/spare-parts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStock: (id: string, adjustment?: number, newQuantity?: number) =>
    fetchJson<SparePart>(`/spare-parts/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ adjustment, newQuantity }),
    }),
  deleteSparePart: (id: string) =>
    fetchJson<{ message: string }>(`/spare-parts/${id}`, { method: 'DELETE' }),

  // Bills
  getBills: (params?: { paymentStatus?: string; customerId?: string }) => {
    const q = new URLSearchParams();
    if (params?.paymentStatus) q.append('paymentStatus', params.paymentStatus);
    if (params?.customerId) q.append('customerId', params.customerId);
    return fetchJson<Bill[]>(`/bills?${q.toString()}`);
  },
  createBill: (data: Partial<Bill>) =>
    fetchJson<Bill>('/bills', { method: 'POST', body: JSON.stringify(data) }),
  payBill: (id: string, paymentMethod?: string) =>
    fetchJson<Bill>(`/bills/${id}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentMethod, paymentStatus: 'Paid' }),
    }),
  deleteBill: (id: string) =>
    fetchJson<{ message: string }>(`/bills/${id}`, { method: 'DELETE' }),

  // Service History
  getServiceHistory: (carId?: string) => {
    const q = new URLSearchParams();
    if (carId) q.append('carId', carId);
    return fetchJson<ServiceHistoryItem[]>(`/service-history?${q.toString()}`);
  },

  // Predictive Service Alerts & Health Scoring
  getPredictiveAlerts: () => fetchJson<PredictiveAlert[]>('/predictions/all'),
  getCarPrediction: (carId: string) => fetchJson<PredictiveAlert>(`/predictions/car/${carId}`),

  // Analytics & MongoDB Aggregations
  getAggregations: () => fetchJson<AggregationPipelineDoc[]>('/analytics/aggregations'),
  runCustomPipeline: (collectionName: string, pipeline: any[]) =>
    fetchJson<{ success: boolean; count: number; result: any[] }>('/analytics/custom-pipeline', {
      method: 'POST',
      body: JSON.stringify({ collectionName, pipeline }),
    }),
};
