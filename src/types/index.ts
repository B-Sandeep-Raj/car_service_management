export type MembershipTier = 'Standard' | 'Premium' | 'VIP';

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  membershipTier: MembershipTier;
  createdAt: string;
}

export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';

export interface Car {
  _id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  fuelType: FuelType;
  mileage: number;
  customerId: string;
  createdAt: string;
}

export type ServiceType =
  | 'General Maintenance'
  | 'Brake System'
  | 'Engine Diagnostics'
  | 'Transmission Repair'
  | 'Electrical & Battery'
  | 'AC & Climate'
  | 'Tire & Suspension'
  | 'Oil & Filter Change';

export type ServiceStatus =
  | 'Pending'
  | 'In Progress'
  | 'Awaiting Parts'
  | 'Completed'
  | 'Cancelled';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface PartUsage {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
}

export interface Service {
  _id: string;
  carId: string;
  customerId: string;
  mechanicId: string;
  serviceType: ServiceType;
  description: string;
  status: ServiceStatus;
  priority: Priority;
  estimatedCost: number;
  actualCost: number;
  partsUsed: PartUsage[];
  laborHours: number;
  startDate: string;
  completedDate?: string;
  healthScoreBefore: number;
  healthScoreAfter: number;
  createdAt: string;
}

export type MechanicStatus = 'Available' | 'Busy' | 'On Leave';

export interface Mechanic {
  _id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  rating: number; // 1.0 - 5.0
  phone: string;
  email: string;
  status: MechanicStatus;
  createdAt: string;
}

export type PartCategory =
  | 'Brakes'
  | 'Filters'
  | 'Engine'
  | 'Transmission'
  | 'Fluids'
  | 'Electrical'
  | 'Tires'
  | 'Suspension';

export interface SparePart {
  _id: string;
  partNumber: string;
  name: string;
  category: PartCategory;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minimumStockLevel: number;
  unit: string;
  supplier: string;
  createdAt: string;
}

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';
export type PaymentMethod = 'Cash' | 'Card' | 'UPI / Bank Transfer';

export interface Bill {
  _id: string;
  billNumber: string;
  serviceId: string;
  carId: string;
  customerId: string;
  partsTotal: number;
  laborTotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paidDate?: string;
  createdAt: string;
}

export interface ServiceHistoryItem {
  _id: string;
  carId: string;
  serviceId: string;
  serviceDate: string;
  mileageAtService: number;
  serviceType: ServiceType;
  summary: string;
  cost: number;
  mechanicName: string;
  nextRecommendedDate: string;
  nextRecommendedMileage: number;
  healthScore: number;
}

export interface HealthScoreBreakdown {
  score: number;
  category: 'Excellent' | 'Good' | 'Fair' | 'Critical';
  factors: {
    factor: string;
    impact: number;
    description: string;
  }[];
  explanation: string;
}

export interface PredictiveAlert {
  carId: string;
  car: Car;
  customer?: Customer;
  currentMileage: number;
  healthScore: HealthScoreBreakdown;
  lastServiceDate?: string;
  lastServiceMileage?: number;
  avgDaysBetweenServices: number;
  avgDailyMileage: number;
  estimatedNextServiceDate: string;
  estimatedNextServiceMileage: number;
  isOverdue: boolean;
  daysRemaining: number;
  kmRemaining: number;
  recommendedServiceType: ServiceType;
  alertLevel: 'Normal' | 'Upcoming Soon' | 'Overdue';
}

export interface AggregationResultItem {
  _id: string | number | null;
  count?: number;
  total?: number;
  avg?: number;
  [key: string]: any;
}

export interface AggregationPipelineDoc {
  key: string;
  title: string;
  description: string;
  pipeline: any[];
  data: any[];
}
