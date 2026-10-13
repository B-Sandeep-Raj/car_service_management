import { MongoClient, Db } from 'mongodb';
import { Aggregator } from 'mingo';
import type {
  Customer,
  Car,
  Service,
  Mechanic,
  SparePart,
  Bill,
  ServiceHistoryItem,
} from '../src/types/index';

// Initial realistic demo datasets
const initialCustomers: Customer[] = [
  { _id: 'cust_01', name: 'Rajesh Sharma', phone: '+91 98201 23456', email: 'rajesh.sharma@gmail.com', address: '42 MG Road, Indiranagar, Bengaluru', membershipTier: 'VIP', createdAt: '2025-01-10T10:00:00Z' },
  { _id: 'cust_02', name: 'Priya Iyer', phone: '+91 98450 88921', email: 'priya.iyer@outlook.com', address: '12 Palm Meadows, Whitefield, Bengaluru', membershipTier: 'Premium', createdAt: '2025-02-14T11:30:00Z' },
  { _id: 'cust_03', name: 'Amitabh Verma', phone: '+91 97112 34567', email: 'amitabh.verma@techcorp.in', address: '88 Cyber Gateway, HSR Layout, Bengaluru', membershipTier: 'Standard', createdAt: '2025-03-01T09:15:00Z' },
  { _id: 'cust_04', name: 'Sneha Patel', phone: '+91 99001 98765', email: 'sneha.patel@gmail.com', address: '15 JP Nagar 4th Phase, Bengaluru', membershipTier: 'Premium', createdAt: '2025-03-12T14:20:00Z' },
  { _id: 'cust_05', name: 'Vikram Malhotra', phone: '+91 98860 11223', email: 'vikram.m@zenith.com', address: '7 Richmond Road, Bengaluru', membershipTier: 'VIP', createdAt: '2025-03-25T16:45:00Z' },
  { _id: 'cust_06', name: 'Ananya Rao', phone: '+91 99452 77889', email: 'ananya.rao@gmail.com', address: '304 Koramangala 5th Block, Bengaluru', membershipTier: 'Standard', createdAt: '2025-04-05T12:00:00Z' },
  { _id: 'cust_07', name: 'Karthik Subramanian', phone: '+91 97400 33445', email: 'karthik.sub@fintech.co', address: '99 Bellandur Eco-Space, Bengaluru', membershipTier: 'Premium', createdAt: '2025-04-18T10:10:00Z' },
  { _id: 'cust_08', name: 'Divya Nambiar', phone: '+91 98440 66554', email: 'divya.nambiar@gmail.com', address: '21 Malleshwaram 7th Cross, Bengaluru', membershipTier: 'Standard', createdAt: '2025-05-02T15:30:00Z' },
  { _id: 'cust_09', name: 'Rohan Mehra', phone: '+91 98199 44332', email: 'rohan.mehra@gmail.com', address: '55 Sadashivanagar, Bengaluru', membershipTier: 'VIP', createdAt: '2025-05-19T13:40:00Z' },
  { _id: 'cust_10', name: 'Pooja Hegde', phone: '+91 98801 55667', email: 'pooja.hegde@designstudio.in', address: '102 Lavelle Road, Bengaluru', membershipTier: 'Standard', createdAt: '2025-06-01T08:50:00Z' },
  { _id: 'cust_11', name: 'Arjun Nanda', phone: '+91 99723 11448', email: 'arjun.nanda@gmail.com', address: '78 Sarjapur Main Road, Bengaluru', membershipTier: 'Premium', createdAt: '2025-06-20T17:15:00Z' },
  { _id: 'cust_12', name: 'Meera Chawla', phone: '+91 98455 99001', email: 'meera.chawla@gmail.com', address: '14 Vasanth Nagar, Bengaluru', membershipTier: 'Standard', createdAt: '2025-07-04T11:00:00Z' },
];

const initialCars: Car[] = [
  { _id: 'car_01', licensePlate: 'KA 03 MN 4589', brand: 'Toyota', model: 'Innova Crysta', year: 2021, vin: 'MBJ11BB00M1203948', fuelType: 'Diesel', mileage: 62400, customerId: 'cust_01', createdAt: '2025-01-10T10:05:00Z' },
  { _id: 'car_02', licensePlate: 'KA 01 MJ 8821', brand: 'Toyota', model: 'Fortuner 4x4', year: 2022, vin: 'MBJ11CC00N4892011', fuelType: 'Diesel', mileage: 48900, customerId: 'cust_01', createdAt: '2025-01-10T10:10:00Z' },
  { _id: 'car_03', licensePlate: 'KA 05 AB 1234', brand: 'Honda', model: 'City ZX i-VTEC', year: 2020, vin: 'MAKGM6630L0091823', fuelType: 'Petrol', mileage: 51200, customerId: 'cust_02', createdAt: '2025-02-14T11:35:00Z' },
  { _id: 'car_04', licensePlate: 'KA 51 ME 9042', brand: 'Hyundai', model: 'Creta SX(O)', year: 2022, vin: 'MALC181CLNM098231', fuelType: 'Diesel', mileage: 39500, customerId: 'cust_03', createdAt: '2025-03-01T09:20:00Z' },
  { _id: 'car_05', licensePlate: 'KA 04 MP 7711', brand: 'BMW', model: '3 Series 330i M Sport', year: 2021, vin: 'WBA5R1103MFA88231', fuelType: 'Petrol', mileage: 34100, customerId: 'cust_05', createdAt: '2025-03-25T16:50:00Z' },
  { _id: 'car_06', licensePlate: 'KA 03 NX 5621', brand: 'Volkswagen', model: 'Virtus GT Plus', year: 2023, vin: 'WVWZZZ6RZPY091244', fuelType: 'Petrol', mileage: 22800, customerId: 'cust_04', createdAt: '2025-03-12T14:25:00Z' },
  { _id: 'car_07', licensePlate: 'KA 01 ED 3390', brand: 'Tata', model: 'Nexon EV Empowered', year: 2023, vin: 'MAT623910P9912044', fuelType: 'Electric', mileage: 27500, customerId: 'cust_06', createdAt: '2025-04-05T12:05:00Z' },
  { _id: 'car_08', licensePlate: 'KA 53 ML 8080', brand: 'Mahindra', model: 'XUV700 AX7L', year: 2022, vin: 'MA1TA2WJ4NM401928', fuelType: 'Diesel', mileage: 45600, customerId: 'cust_07', createdAt: '2025-04-18T10:15:00Z' },
  { _id: 'car_09', licensePlate: 'KA 02 MH 1122', brand: 'Honda', model: 'Elevate ZX CVT', year: 2023, vin: 'MAKD18870P0019283', fuelType: 'Petrol', mileage: 18400, customerId: 'cust_08', createdAt: '2025-05-02T15:35:00Z' },
  { _id: 'car_10', licensePlate: 'KA 04 NA 9999', brand: 'Mercedes-Benz', model: 'E-Class E220d', year: 2021, vin: 'WDD2130042A991024', fuelType: 'Diesel', mileage: 42000, customerId: 'cust_09', createdAt: '2025-05-19T13:45:00Z' },
  { _id: 'car_11', licensePlate: 'KA 05 MK 4410', brand: 'Maruti Suzuki', model: 'Brezza ZXi+', year: 2022, vin: 'MA3FNEB1SN8099231', fuelType: 'Petrol', mileage: 36700, customerId: 'cust_10', createdAt: '2025-06-01T08:55:00Z' },
  { _id: 'car_12', licensePlate: 'KA 03 MZ 6633', brand: 'Hyundai', model: 'Verna 1.5 Turbo', year: 2023, vin: 'MALC141ELPM902341', fuelType: 'Petrol', mileage: 21500, customerId: 'cust_11', createdAt: '2025-06-20T17:20:00Z' },
  { _id: 'car_13', licensePlate: 'KA 01 NE 2211', brand: 'Toyota', model: 'Urban Cruiser Hyryder', year: 2023, vin: 'MBJ13EE00P9102931', fuelType: 'Hybrid', mileage: 26300, customerId: 'cust_12', createdAt: '2025-07-04T11:05:00Z' },
  { _id: 'car_14', licensePlate: 'KA 04 MQ 9831', brand: 'Kia', model: 'Seltos GTX Plus', year: 2021, vin: 'MZBJA81CLMM009182', fuelType: 'Diesel', mileage: 53100, customerId: 'cust_04', createdAt: '2025-07-15T14:00:00Z' },
  { _id: 'car_15', licensePlate: 'KA 05 NX 1001', brand: 'Skoda', model: 'Slavia 1.5 TSI Style', year: 2022, vin: 'TMBZZZ6RZNZ019283', fuelType: 'Petrol', mileage: 31200, customerId: 'cust_02', createdAt: '2025-08-01T10:00:00Z' },
  { _id: 'car_16', licensePlate: 'KA 03 MP 4477', brand: 'BMW', model: 'X5 xDrive30d', year: 2020, vin: 'WBAJU8100LL902184', fuelType: 'Diesel', mileage: 71000, customerId: 'cust_05', createdAt: '2025-08-10T12:00:00Z' },
];

const initialMechanics: Mechanic[] = [
  { _id: 'mech_01', name: 'Santosh Kumar', specialty: 'Engine Diagnostics & Overhaul', experienceYears: 12, rating: 4.9, phone: '+91 94480 12345', email: 'santosh.k@autotech.in', status: 'Busy', createdAt: '2024-01-01T08:00:00Z' },
  { _id: 'mech_02', name: 'Ramesh Babu', specialty: 'Transmission & Gearbox Specialist', experienceYears: 9, rating: 4.8, phone: '+91 94480 23456', email: 'ramesh.b@autotech.in', status: 'Available', createdAt: '2024-01-01T08:00:00Z' },
  { _id: 'mech_03', name: 'Deepak Francis', specialty: 'Electrical Systems & Sensors', experienceYears: 7, rating: 4.7, phone: '+91 94480 34567', email: 'deepak.f@autotech.in', status: 'Busy', createdAt: '2024-03-01T08:00:00Z' },
  { _id: 'mech_04', name: 'Manjunath Reddy', specialty: 'Brakes, Suspension & Alignment', experienceYears: 11, rating: 4.9, phone: '+91 94480 45678', email: 'manju.r@autotech.in', status: 'Available', createdAt: '2024-03-01T08:00:00Z' },
  { _id: 'mech_05', name: 'Farhan Akhtar', specialty: 'HVAC & Climate Control', experienceYears: 6, rating: 4.6, phone: '+91 94480 56789', email: 'farhan.a@autotech.in', status: 'Available', createdAt: '2024-06-01T08:00:00Z' },
  { _id: 'mech_06', name: 'Kiran Gurung', specialty: 'Periodic Maintenance & Detailing', experienceYears: 5, rating: 4.5, phone: '+91 94480 67890', email: 'kiran.g@autotech.in', status: 'On Leave', createdAt: '2024-08-01T08:00:00Z' },
];

const initialSpareParts: SparePart[] = [
  { _id: 'part_01', partNumber: 'BP-FR-019', name: 'Front Ceramic Brake Pads (Set)', category: 'Brakes', costPrice: 2200, sellingPrice: 3400, stockQuantity: 18, minimumStockLevel: 5, unit: 'Set', supplier: 'Bosch Automotive India', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_02', partNumber: 'BP-RR-020', name: 'Rear Brake Pads (Set)', category: 'Brakes', costPrice: 1800, sellingPrice: 2800, stockQuantity: 14, minimumStockLevel: 5, unit: 'Set', supplier: 'Bosch Automotive India', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_03', partNumber: 'BD-VT-104', name: 'Ventilated Brake Rotor Disc', category: 'Brakes', costPrice: 3500, sellingPrice: 5200, stockQuantity: 8, minimumStockLevel: 4, unit: 'Piece', supplier: 'Brembo OE India', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_04', partNumber: 'OF-SY-001', name: 'Synthetic Spin-On Oil Filter', category: 'Filters', costPrice: 320, sellingPrice: 550, stockQuantity: 42, minimumStockLevel: 15, unit: 'Piece', supplier: 'Mann-Filter Corp', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_05', partNumber: 'AF-HE-002', name: 'Engine High-Flow Air Filter', category: 'Filters', costPrice: 480, sellingPrice: 850, stockQuantity: 28, minimumStockLevel: 10, unit: 'Piece', supplier: 'Mann-Filter Corp', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_06', partNumber: 'CF-AC-003', name: 'Cabin Carbon Activated AC Filter', category: 'Filters', costPrice: 520, sellingPrice: 950, stockQuantity: 19, minimumStockLevel: 8, unit: 'Piece', supplier: 'Denso Corp', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_07', partNumber: 'FF-DS-004', name: 'High-Pressure Diesel Fuel Filter', category: 'Filters', costPrice: 1100, sellingPrice: 1800, stockQuantity: 11, minimumStockLevel: 5, unit: 'Piece', supplier: 'Delphi Technologies', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_08', partNumber: 'EG-SP-011', name: 'Iridium Spark Plug (Pack of 4)', category: 'Engine', costPrice: 1600, sellingPrice: 2600, stockQuantity: 12, minimumStockLevel: 4, unit: 'Pack', supplier: 'NGK Spark Plugs', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_09', partNumber: 'EG-TB-012', name: 'Timing Belt & Tensioner Kit', category: 'Engine', costPrice: 4800, sellingPrice: 7200, stockQuantity: 4, minimumStockLevel: 3, unit: 'Kit', supplier: 'Continental Contitech', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_10', partNumber: 'EG-WP-013', name: 'Engine Water Pump Assembly', category: 'Engine', costPrice: 2900, sellingPrice: 4400, stockQuantity: 3, minimumStockLevel: 4, unit: 'Piece', supplier: 'AISIN Seiki', createdAt: '2025-01-01T00:00:00Z' }, // LOW STOCK ALERT
  { _id: 'part_11', partNumber: 'FL-EO-5W30', name: 'Fully Synthetic 5W-30 Motor Oil (4L)', category: 'Fluids', costPrice: 1900, sellingPrice: 2950, stockQuantity: 36, minimumStockLevel: 12, unit: 'Can', supplier: 'Mobil 1 / ExxonMobil', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_12', partNumber: 'FL-EO-0W20', name: 'Fully Synthetic 0W-20 Motor Oil (4L)', category: 'Fluids', costPrice: 2100, sellingPrice: 3200, stockQuantity: 24, minimumStockLevel: 10, unit: 'Can', supplier: 'Castrol Edge', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_13', partNumber: 'FL-BF-DOT4', name: 'DOT 4 High Temp Brake Fluid (1L)', category: 'Fluids', costPrice: 450, sellingPrice: 750, stockQuantity: 22, minimumStockLevel: 8, unit: 'Bottle', supplier: 'Motul Lubricants', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_14', partNumber: 'FL-CL-LL', name: 'Long-Life Premix Engine Coolant (3L)', category: 'Fluids', costPrice: 700, sellingPrice: 1150, stockQuantity: 15, minimumStockLevel: 6, unit: 'Can', supplier: 'Valvoline Inc', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_15', partNumber: 'FL-TF-ATF', name: 'Automatic Transmission Fluid ATF (1L)', category: 'Fluids', costPrice: 850, sellingPrice: 1400, stockQuantity: 9, minimumStockLevel: 6, unit: 'Bottle', supplier: 'Idemitsu Lube', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_16', partNumber: 'EL-BT-DIN60', name: 'Exide 60Ah Maintenance-Free Battery', category: 'Electrical', costPrice: 4800, sellingPrice: 6800, stockQuantity: 6, minimumStockLevel: 3, unit: 'Piece', supplier: 'Exide Industries Ltd', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_17', partNumber: 'EL-AL-12V', name: 'Heavy Duty 12V 90A Alternator', category: 'Electrical', costPrice: 7200, sellingPrice: 10500, stockQuantity: 2, minimumStockLevel: 3, unit: 'Piece', supplier: 'Lucas-TVS India', createdAt: '2025-01-01T00:00:00Z' }, // LOW STOCK ALERT
  { _id: 'part_18', partNumber: 'EL-HL-H7', name: 'LED Headlamp Bulbs H7 Pair', category: 'Electrical', costPrice: 1400, sellingPrice: 2400, stockQuantity: 16, minimumStockLevel: 6, unit: 'Pair', supplier: 'Philips Automotive', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_19', partNumber: 'TR-CK-031', name: 'Clutch Disc & Pressure Plate Kit', category: 'Transmission', costPrice: 5600, sellingPrice: 8500, stockQuantity: 4, minimumStockLevel: 3, unit: 'Kit', supplier: 'Valeo India', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_20', partNumber: 'SP-SA-FR', name: 'Front Gas Shock Absorber Strut', category: 'Suspension', costPrice: 3200, sellingPrice: 4900, stockQuantity: 7, minimumStockLevel: 4, unit: 'Piece', supplier: 'Monroe Shock Absorbers', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_21', partNumber: 'SP-LB-042', name: 'Front Lower Suspension Arm Bushing', category: 'Suspension', costPrice: 650, sellingPrice: 1100, stockQuantity: 18, minimumStockLevel: 6, unit: 'Piece', supplier: 'Talbros Marugo', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_22', partNumber: 'SP-TE-043', name: 'Steering Tie Rod End (Pair)', category: 'Suspension', costPrice: 1200, sellingPrice: 1950, stockQuantity: 10, minimumStockLevel: 4, unit: 'Pair', supplier: 'Rane Madras Ltd', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_23', partNumber: 'AC-CM-101', name: 'AC Compressor Unit with Magnetic Clutch', category: 'Engine', costPrice: 12500, sellingPrice: 18000, stockQuantity: 2, minimumStockLevel: 2, unit: 'Piece', supplier: 'Subros Limited', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_24', partNumber: 'AC-GS-R134', name: 'R134a AC Refrigerant Gas Canister (450g)', category: 'Fluids', costPrice: 550, sellingPrice: 950, stockQuantity: 25, minimumStockLevel: 10, unit: 'Can', supplier: 'Chemours DuPont', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'part_25', partNumber: 'TR-TS-205', name: 'Michelin Primacy 4ST 205/55 R16 Tyre', category: 'Tires', costPrice: 6200, sellingPrice: 8400, stockQuantity: 8, minimumStockLevel: 4, unit: 'Piece', supplier: 'Michelin India', createdAt: '2025-01-01T00:00:00Z' },
];

const initialServices: Service[] = [
  {
    _id: 'srv_01',
    carId: 'car_01',
    customerId: 'cust_01',
    mechanicId: 'mech_01',
    serviceType: 'Oil & Filter Change',
    description: 'Scheduled 60,000 km oil service, replaced synthetic motor oil and Mann oil filter.',
    status: 'Completed',
    priority: 'Medium',
    estimatedCost: 4500,
    actualCost: 4400,
    partsUsed: [
      { partId: 'part_11', partName: 'Fully Synthetic 5W-30 Motor Oil (4L)', quantity: 1, unitPrice: 2950 },
      { partId: 'part_04', partName: 'Synthetic Spin-On Oil Filter', quantity: 1, unitPrice: 550 }
    ],
    laborHours: 1.5,
    startDate: '2025-05-10T09:00:00Z',
    completedDate: '2025-05-10T12:00:00Z',
    healthScoreBefore: 82,
    healthScoreAfter: 94,
    createdAt: '2025-05-09T18:00:00Z'
  },
  {
    _id: 'srv_02',
    carId: 'car_03',
    customerId: 'cust_02',
    mechanicId: 'mech_04',
    serviceType: 'Brake System',
    description: 'Front brake grinding noise reported. Inspected and replaced ceramic pads and resurfaced rotors.',
    status: 'Completed',
    priority: 'High',
    estimatedCost: 6500,
    actualCost: 6950,
    partsUsed: [
      { partId: 'part_01', partName: 'Front Ceramic Brake Pads (Set)', quantity: 1, unitPrice: 3400 },
      { partId: 'part_13', partName: 'DOT 4 High Temp Brake Fluid (1L)', quantity: 1, unitPrice: 750 }
    ],
    laborHours: 3.0,
    startDate: '2025-05-18T10:00:00Z',
    completedDate: '2025-05-18T16:00:00Z',
    healthScoreBefore: 68,
    healthScoreAfter: 91,
    createdAt: '2025-05-17T11:20:00Z'
  },
  {
    _id: 'srv_03',
    carId: 'car_05',
    customerId: 'cust_05',
    mechanicId: 'mech_01',
    serviceType: 'Engine Diagnostics',
    description: 'Check engine MIL on. Scanned OBD fault code P0300 (Cylinder Misfire). Replaced Iridium spark plugs.',
    status: 'Completed',
    priority: 'High',
    estimatedCost: 8000,
    actualCost: 7800,
    partsUsed: [
      { partId: 'part_08', partName: 'Iridium Spark Plug (Pack of 4)', quantity: 1, unitPrice: 2600 },
      { partId: 'part_05', partName: 'Engine High-Flow Air Filter', quantity: 1, unitPrice: 850 }
    ],
    laborHours: 3.5,
    startDate: '2025-06-02T09:30:00Z',
    completedDate: '2025-06-03T11:00:00Z',
    healthScoreBefore: 70,
    healthScoreAfter: 93,
    createdAt: '2025-06-01T15:00:00Z'
  },
  {
    _id: 'srv_04',
    carId: 'car_04',
    customerId: 'cust_03',
    mechanicId: 'mech_05',
    serviceType: 'AC & Climate',
    description: 'AC blowing lukewarm air during peak noon. Evacuated system, checked for leaks, and recharged R134a refrigerant.',
    status: 'Completed',
    priority: 'Medium',
    estimatedCost: 3500,
    actualCost: 3400,
    partsUsed: [
      { partId: 'part_06', partName: 'Cabin Carbon Activated AC Filter', quantity: 1, unitPrice: 950 },
      { partId: 'part_24', partName: 'R134a AC Refrigerant Gas Canister (450g)', quantity: 1, unitPrice: 950 }
    ],
    laborHours: 2.0,
    startDate: '2025-06-15T11:00:00Z',
    completedDate: '2025-06-15T15:00:00Z',
    healthScoreBefore: 74,
    healthScoreAfter: 90,
    createdAt: '2025-06-14T09:10:00Z'
  },
  {
    _id: 'srv_05',
    carId: 'car_08',
    customerId: 'cust_07',
    mechanicId: 'mech_04',
    serviceType: 'Tire & Suspension',
    description: 'Steering vibration at 80 km/h and thudding over speed breakers. Replaced lower control arm bushings and balanced wheels.',
    status: 'Completed',
    priority: 'Medium',
    estimatedCost: 5500,
    actualCost: 5600,
    partsUsed: [
      { partId: 'part_21', partName: 'Front Lower Suspension Arm Bushing', quantity: 2, unitPrice: 1100 }
    ],
    laborHours: 3.0,
    startDate: '2025-07-02T10:00:00Z',
    completedDate: '2025-07-02T17:00:00Z',
    healthScoreBefore: 65,
    healthScoreAfter: 89,
    createdAt: '2025-07-01T14:30:00Z'
  },
  {
    _id: 'srv_06',
    carId: 'car_02',
    customerId: 'cust_01',
    mechanicId: 'mech_02',
    serviceType: 'Transmission Repair',
    description: 'Slight delay during 2nd to 3rd gear shift. Full ATF transmission flush and fresh filter.',
    status: 'Completed',
    priority: 'High',
    estimatedCost: 9500,
    actualCost: 10200,
    partsUsed: [
      { partId: 'part_15', partName: 'Automatic Transmission Fluid ATF (1L)', quantity: 4, unitPrice: 1400 }
    ],
    laborHours: 4.0,
    startDate: '2025-07-18T09:00:00Z',
    completedDate: '2025-07-19T14:00:00Z',
    healthScoreBefore: 71,
    healthScoreAfter: 92,
    createdAt: '2025-07-17T16:00:00Z'
  },
  {
    _id: 'srv_07',
    carId: 'car_10',
    customerId: 'cust_09',
    mechanicId: 'mech_03',
    serviceType: 'Electrical & Battery',
    description: 'Car struggling to crank in the morning. Battery health at 38%. Replaced with Exide 60Ah DIN unit.',
    status: 'Completed',
    priority: 'Urgent',
    estimatedCost: 8500,
    actualCost: 8300,
    partsUsed: [
      { partId: 'part_16', partName: 'Exide 60Ah Maintenance-Free Battery', quantity: 1, unitPrice: 6800 }
    ],
    laborHours: 1.5,
    startDate: '2025-08-05T08:30:00Z',
    completedDate: '2025-08-05T11:00:00Z',
    healthScoreBefore: 62,
    healthScoreAfter: 95,
    createdAt: '2025-08-04T19:00:00Z'
  },
  {
    _id: 'srv_08',
    carId: 'car_06',
    customerId: 'cust_04',
    mechanicId: 'mech_01',
    serviceType: 'General Maintenance',
    description: 'Periodic 20,000 km general service. Engine oil change, air/cabin filters, all fluid levels topped.',
    status: 'Completed',
    priority: 'Low',
    estimatedCost: 6000,
    actualCost: 6100,
    partsUsed: [
      { partId: 'part_12', partName: 'Fully Synthetic 0W-20 Motor Oil (4L)', quantity: 1, unitPrice: 3200 },
      { partId: 'part_04', partName: 'Synthetic Spin-On Oil Filter', quantity: 1, unitPrice: 550 },
      { partId: 'part_05', partName: 'Engine High-Flow Air Filter', quantity: 1, unitPrice: 850 }
    ],
    laborHours: 2.0,
    startDate: '2025-08-20T10:00:00Z',
    completedDate: '2025-08-20T15:30:00Z',
    healthScoreBefore: 85,
    healthScoreAfter: 97,
    createdAt: '2025-08-19T11:00:00Z'
  },
  {
    _id: 'srv_09',
    carId: 'car_14',
    customerId: 'cust_04',
    mechanicId: 'mech_04',
    serviceType: 'Brake System',
    description: 'Rear brake shoe inspection and brake fluid bleeding.',
    status: 'Completed',
    priority: 'Medium',
    estimatedCost: 4800,
    actualCost: 4650,
    partsUsed: [
      { partId: 'part_02', partName: 'Rear Brake Pads (Set)', quantity: 1, unitPrice: 2800 },
      { partId: 'part_13', partName: 'DOT 4 High Temp Brake Fluid (1L)', quantity: 1, unitPrice: 750 }
    ],
    laborHours: 2.0,
    startDate: '2025-09-04T09:30:00Z',
    completedDate: '2025-09-04T13:30:00Z',
    healthScoreBefore: 72,
    healthScoreAfter: 92,
    createdAt: '2025-09-03T14:15:00Z'
  },
  {
    _id: 'srv_10',
    carId: 'car_11',
    customerId: 'cust_10',
    mechanicId: 'mech_01',
    serviceType: 'Oil & Filter Change',
    description: '35,000 km oil service with Castrol Edge synthetic and OEM filter replacement.',
    status: 'Completed',
    priority: 'Low',
    estimatedCost: 4200,
    actualCost: 4100,
    partsUsed: [
      { partId: 'part_12', partName: 'Fully Synthetic 0W-20 Motor Oil (4L)', quantity: 1, unitPrice: 3200 },
      { partId: 'part_04', partName: 'Synthetic Spin-On Oil Filter', quantity: 1, unitPrice: 550 }
    ],
    laborHours: 1.5,
    startDate: '2025-09-15T11:00:00Z',
    completedDate: '2025-09-15T14:00:00Z',
    healthScoreBefore: 80,
    healthScoreAfter: 95,
    createdAt: '2025-09-14T10:00:00Z'
  },
  {
    _id: 'srv_11',
    carId: 'car_16',
    customerId: 'cust_05',
    mechanicId: 'mech_02',
    serviceType: 'Engine Diagnostics',
    description: 'Coolant temperature fluctuating. Replaced water pump assembly and flushed coolant.',
    status: 'Completed',
    priority: 'High',
    estimatedCost: 11000,
    actualCost: 10850,
    partsUsed: [
      { partId: 'part_10', partName: 'Engine Water Pump Assembly', quantity: 1, unitPrice: 4400 },
      { partId: 'part_14', partName: 'Long-Life Premix Engine Coolant (3L)', quantity: 2, unitPrice: 1150 }
    ],
    laborHours: 4.5,
    startDate: '2025-09-28T09:00:00Z',
    completedDate: '2025-09-29T16:00:00Z',
    healthScoreBefore: 64,
    healthScoreAfter: 91,
    createdAt: '2025-09-27T17:00:00Z'
  },
  {
    _id: 'srv_12',
    carId: 'car_15',
    customerId: 'cust_02',
    mechanicId: 'mech_03',
    serviceType: 'Electrical & Battery',
    description: 'Headlight low-beam failure. Upgraded to high-output LED H7 bulbs with relay harness.',
    status: 'Completed',
    priority: 'Low',
    estimatedCost: 3500,
    actualCost: 3400,
    partsUsed: [
      { partId: 'part_18', partName: 'LED Headlamp Bulbs H7 Pair', quantity: 1, unitPrice: 2400 }
    ],
    laborHours: 1.5,
    startDate: '2025-10-02T14:00:00Z',
    completedDate: '2025-10-02T16:30:00Z',
    healthScoreBefore: 84,
    healthScoreAfter: 96,
    createdAt: '2025-10-01T12:00:00Z'
  },
  // Active/Current services
  {
    _id: 'srv_13',
    carId: 'car_01',
    customerId: 'cust_01',
    mechanicId: 'mech_01',
    serviceType: 'Brake System',
    description: 'Brake pedal feels soft. Inspecting brake booster and fluid flush.',
    status: 'In Progress',
    priority: 'High',
    estimatedCost: 5200,
    actualCost: 0,
    partsUsed: [
      { partId: 'part_01', partName: 'Front Ceramic Brake Pads (Set)', quantity: 1, unitPrice: 3400 }
    ],
    laborHours: 2.5,
    startDate: '2025-10-10T10:00:00Z',
    healthScoreBefore: 75,
    healthScoreAfter: 88,
    createdAt: '2025-10-09T18:00:00Z'
  },
  {
    _id: 'srv_14',
    carId: 'car_05',
    customerId: 'cust_05',
    mechanicId: 'mech_03',
    serviceType: 'Transmission Repair',
    description: 'Clutch slippage detected on hard acceleration.',
    status: 'Awaiting Parts',
    priority: 'Urgent',
    estimatedCost: 15500,
    actualCost: 0,
    partsUsed: [
      { partId: 'part_19', partName: 'Clutch Disc & Pressure Plate Kit', quantity: 1, unitPrice: 8500 }
    ],
    laborHours: 6.0,
    startDate: '2025-10-11T09:00:00Z',
    healthScoreBefore: 60,
    healthScoreAfter: 89,
    createdAt: '2025-10-10T15:30:00Z'
  },
  {
    _id: 'srv_15',
    carId: 'car_09',
    customerId: 'cust_08',
    mechanicId: 'mech_04',
    serviceType: 'General Maintenance',
    description: 'Periodic 20,000 km general checkup booked online.',
    status: 'Pending',
    priority: 'Low',
    estimatedCost: 4500,
    actualCost: 0,
    partsUsed: [
      { partId: 'part_04', partName: 'Synthetic Spin-On Oil Filter', quantity: 1, unitPrice: 550 },
      { partId: 'part_11', partName: 'Fully Synthetic 5W-30 Motor Oil (4L)', quantity: 1, unitPrice: 2950 }
    ],
    laborHours: 1.5,
    startDate: '2025-10-14T09:00:00Z',
    healthScoreBefore: 88,
    healthScoreAfter: 98,
    createdAt: '2025-10-12T08:00:00Z'
  },
  {
    _id: 'srv_16',
    carId: 'car_12',
    customerId: 'cust_11',
    mechanicId: 'mech_05',
    serviceType: 'AC & Climate',
    description: 'AC cooling coil inspection and sanitization service.',
    status: 'Pending',
    priority: 'Medium',
    estimatedCost: 3200,
    actualCost: 0,
    partsUsed: [
      { partId: 'part_06', partName: 'Cabin Carbon Activated AC Filter', quantity: 1, unitPrice: 950 }
    ],
    laborHours: 2.0,
    startDate: '2025-10-15T11:00:00Z',
    healthScoreBefore: 82,
    healthScoreAfter: 94,
    createdAt: '2025-10-12T09:00:00Z'
  }
];

const initialBills: Bill[] = [
  { _id: 'bill_01', billNumber: 'INV-2025-001', serviceId: 'srv_01', carId: 'car_01', customerId: 'cust_01', partsTotal: 3500, laborTotal: 900, taxAmount: 792, discountAmount: 792, grandTotal: 4400, paymentStatus: 'Paid', paymentMethod: 'UPI / Bank Transfer', paidDate: '2025-05-10T12:30:00Z', createdAt: '2025-05-10T12:00:00Z' },
  { _id: 'bill_02', billNumber: 'INV-2025-002', serviceId: 'srv_02', carId: 'car_03', customerId: 'cust_02', partsTotal: 4150, laborTotal: 2800, taxAmount: 1251, discountAmount: 1251, grandTotal: 6950, paymentStatus: 'Paid', paymentMethod: 'Card', paidDate: '2025-05-18T16:30:00Z', createdAt: '2025-05-18T16:00:00Z' },
  { _id: 'bill_03', billNumber: 'INV-2025-003', serviceId: 'srv_03', carId: 'car_05', customerId: 'cust_05', partsTotal: 3450, laborTotal: 4350, taxAmount: 1404, discountAmount: 1404, grandTotal: 7800, paymentStatus: 'Paid', paymentMethod: 'Card', paidDate: '2025-06-03T11:45:00Z', createdAt: '2025-06-03T11:00:00Z' },
  { _id: 'bill_04', billNumber: 'INV-2025-004', serviceId: 'srv_04', carId: 'car_04', customerId: 'cust_03', partsTotal: 1900, laborTotal: 1500, taxAmount: 612, discountAmount: 612, grandTotal: 3400, paymentStatus: 'Paid', paymentMethod: 'Cash', paidDate: '2025-06-15T15:20:00Z', createdAt: '2025-06-15T15:00:00Z' },
  { _id: 'bill_05', billNumber: 'INV-2025-005', serviceId: 'srv_05', carId: 'car_08', customerId: 'cust_07', partsTotal: 2200, laborTotal: 3400, taxAmount: 1008, discountAmount: 1008, grandTotal: 5600, paymentStatus: 'Paid', paymentMethod: 'UPI / Bank Transfer', paidDate: '2025-07-02T17:15:00Z', createdAt: '2025-07-02T17:00:00Z' },
  { _id: 'bill_06', billNumber: 'INV-2025-006', serviceId: 'srv_06', carId: 'car_02', customerId: 'cust_01', partsTotal: 5600, laborTotal: 4600, taxAmount: 1836, discountAmount: 1836, grandTotal: 10200, paymentStatus: 'Paid', paymentMethod: 'Card', paidDate: '2025-07-19T14:30:00Z', createdAt: '2025-07-19T14:00:00Z' },
  { _id: 'bill_07', billNumber: 'INV-2025-007', serviceId: 'srv_07', carId: 'car_10', customerId: 'cust_09', partsTotal: 6800, laborTotal: 1500, taxAmount: 1494, discountAmount: 1494, grandTotal: 8300, paymentStatus: 'Paid', paymentMethod: 'Card', paidDate: '2025-08-05T11:15:00Z', createdAt: '2025-08-05T11:00:00Z' },
  { _id: 'bill_08', billNumber: 'INV-2025-008', serviceId: 'srv_08', carId: 'car_06', customerId: 'cust_04', partsTotal: 4600, laborTotal: 1500, taxAmount: 1098, discountAmount: 1098, grandTotal: 6100, paymentStatus: 'Paid', paymentMethod: 'UPI / Bank Transfer', paidDate: '2025-08-20T16:00:00Z', createdAt: '2025-08-20T15:30:00Z' },
  { _id: 'bill_09', billNumber: 'INV-2025-009', serviceId: 'srv_09', carId: 'car_14', customerId: 'cust_04', partsTotal: 3550, laborTotal: 1100, taxAmount: 837, discountAmount: 837, grandTotal: 4650, paymentStatus: 'Paid', paymentMethod: 'Cash', paidDate: '2025-09-04T13:45:00Z', createdAt: '2025-09-04T13:30:00Z' },
  { _id: 'bill_10', billNumber: 'INV-2025-010', serviceId: 'srv_10', carId: 'car_11', customerId: 'cust_10', partsTotal: 3750, laborTotal: 350, taxAmount: 738, discountAmount: 738, grandTotal: 4100, paymentStatus: 'Paid', paymentMethod: 'UPI / Bank Transfer', paidDate: '2025-09-15T14:15:00Z', createdAt: '2025-09-15T14:00:00Z' },
  { _id: 'bill_11', billNumber: 'INV-2025-011', serviceId: 'srv_11', carId: 'car_16', customerId: 'cust_05', partsTotal: 6700, laborTotal: 4150, taxAmount: 1953, discountAmount: 1953, grandTotal: 10850, paymentStatus: 'Paid', paymentMethod: 'Card', paidDate: '2025-09-29T16:45:00Z', createdAt: '2025-09-29T16:00:00Z' },
  { _id: 'bill_12', billNumber: 'INV-2025-012', serviceId: 'srv_12', carId: 'car_15', customerId: 'cust_02', partsTotal: 2400, laborTotal: 1000, taxAmount: 612, discountAmount: 612, grandTotal: 3400, paymentStatus: 'Paid', paymentMethod: 'UPI / Bank Transfer', paidDate: '2025-10-02T17:00:00Z', createdAt: '2025-10-02T16:30:00Z' },
  // Active bills
  { _id: 'bill_13', billNumber: 'INV-2025-013', serviceId: 'srv_13', carId: 'car_01', customerId: 'cust_01', partsTotal: 3400, laborTotal: 1800, taxAmount: 936, discountAmount: 500, grandTotal: 5636, paymentStatus: 'Unpaid', paymentMethod: 'Card', createdAt: '2025-10-10T10:30:00Z' },
  { _id: 'bill_14', billNumber: 'INV-2025-014', serviceId: 'srv_14', carId: 'car_05', customerId: 'cust_05', partsTotal: 8500, laborTotal: 6000, taxAmount: 2610, discountAmount: 1000, grandTotal: 16110, paymentStatus: 'Partially Paid', paymentMethod: 'Card', createdAt: '2025-10-11T10:00:00Z' }
];

const initialServiceHistory: ServiceHistoryItem[] = [
  { _id: 'hist_01', carId: 'car_01', serviceId: 'srv_01', serviceDate: '2025-05-10', mileageAtService: 60100, serviceType: 'Oil & Filter Change', summary: 'Routine 60k synthetic oil replacement', cost: 4400, mechanicName: 'Santosh Kumar', nextRecommendedDate: '2025-11-10', nextRecommendedMileage: 70000, healthScore: 94 },
  { _id: 'hist_02', carId: 'car_03', serviceId: 'srv_02', serviceDate: '2025-05-18', mileageAtService: 48900, serviceType: 'Brake System', summary: 'Front ceramic brake pads & DOT4 fluid renewal', cost: 6950, mechanicName: 'Manjunath Reddy', nextRecommendedDate: '2025-11-18', nextRecommendedMileage: 58000, healthScore: 91 },
  { _id: 'hist_03', carId: 'car_05', serviceId: 'srv_03', serviceDate: '2025-06-03', mileageAtService: 31800, serviceType: 'Engine Diagnostics', summary: 'Resolved P0300 misfire, replaced 4x Iridium spark plugs', cost: 7800, mechanicName: 'Santosh Kumar', nextRecommendedDate: '2025-12-03', nextRecommendedMileage: 40000, healthScore: 93 },
  { _id: 'hist_04', carId: 'car_04', serviceId: 'srv_04', serviceDate: '2025-06-15', mileageAtService: 36900, serviceType: 'AC & Climate', summary: 'R134a refrigerant recharge & activated cabin filter', cost: 3400, mechanicName: 'Farhan Akhtar', nextRecommendedDate: '2025-12-15', nextRecommendedMileage: 46000, healthScore: 90 },
  { _id: 'hist_05', carId: 'car_08', serviceId: 'srv_05', serviceDate: '2025-07-02', mileageAtService: 42800, serviceType: 'Tire & Suspension', summary: 'Front suspension lower arm bushes replaced & 4-wheel alignment', cost: 5600, mechanicName: 'Manjunath Reddy', nextRecommendedDate: '2026-01-02', nextRecommendedMileage: 52000, healthScore: 89 },
  { _id: 'hist_06', carId: 'car_02', serviceId: 'srv_06', serviceDate: '2025-07-19', mileageAtService: 46200, serviceType: 'Transmission Repair', summary: 'Full transmission fluid flush (4L ATF) & electronic recalibration', cost: 10200, mechanicName: 'Ramesh Babu', nextRecommendedDate: '2026-01-19', nextRecommendedMileage: 66000, healthScore: 92 },
  { _id: 'hist_07', carId: 'car_10', serviceId: 'srv_07', serviceDate: '2025-08-05', mileageAtService: 40100, serviceType: 'Electrical & Battery', summary: 'Installed Exide 60Ah AGM battery & alternator output test', cost: 8300, mechanicName: 'Deepak Francis', nextRecommendedDate: '2026-02-05', nextRecommendedMileage: 50000, healthScore: 95 },
  { _id: 'hist_08', carId: 'car_06', serviceId: 'srv_08', serviceDate: '2025-08-20', mileageAtService: 20900, serviceType: 'General Maintenance', summary: 'Full 20k scheduled service with 0W-20 synth oil & filters', cost: 6100, mechanicName: 'Santosh Kumar', nextRecommendedDate: '2026-02-20', nextRecommendedMileage: 30000, healthScore: 97 },
  { _id: 'hist_09', carId: 'car_14', serviceId: 'srv_09', serviceDate: '2025-09-04', mileageAtService: 51200, serviceType: 'Brake System', summary: 'Rear brake shoes renewal & DOT4 fluid bleed', cost: 4650, mechanicName: 'Manjunath Reddy', nextRecommendedDate: '2026-03-04', nextRecommendedMileage: 61000, healthScore: 92 },
  { _id: 'hist_10', carId: 'car_11', serviceId: 'srv_10', serviceDate: '2025-09-15', mileageAtService: 34800, serviceType: 'Oil & Filter Change', summary: 'Standard oil and spin-on filter swap', cost: 4100, mechanicName: 'Santosh Kumar', nextRecommendedDate: '2026-03-15', nextRecommendedMileage: 44000, healthScore: 95 },
  { _id: 'hist_11', carId: 'car_16', serviceId: 'srv_11', serviceDate: '2025-09-29', mileageAtService: 68500, serviceType: 'Engine Diagnostics', summary: 'Overheating repair: brand new water pump & long-life coolant flush', cost: 10850, mechanicName: 'Ramesh Babu', nextRecommendedDate: '2026-03-29', nextRecommendedMileage: 78000, healthScore: 91 },
  { _id: 'hist_12', carId: 'car_15', serviceId: 'srv_12', serviceDate: '2025-10-02', mileageAtService: 30100, serviceType: 'Electrical & Battery', summary: 'H7 high-output LED installation & beam alignment', cost: 3400, mechanicName: 'Deepak Francis', nextRecommendedDate: '2026-04-02', nextRecommendedMileage: 40000, healthScore: 96 }
];

export type CollectionName =
  | 'Customers'
  | 'Cars'
  | 'Services'
  | 'Mechanics'
  | 'SpareParts'
  | 'Bills'
  | 'ServiceHistory';

// In-Memory MongoDB Engine representation
class InMemoryMongoCollection<T extends { _id: string }> {
  name: string;
  docs: T[];

  constructor(name: string, initialData: T[]) {
    this.name = name;
    this.docs = JSON.parse(JSON.stringify(initialData));
  }

  async find(query: any = {}): Promise<T[]> {
    if (!query || Object.keys(query).length === 0) {
      return JSON.parse(JSON.stringify(this.docs));
    }
    const agg = new Aggregator([{ $match: query }]);
    return agg.run(this.docs) as T[];
  }

  async findOne(query: any): Promise<T | null> {
    const results = await this.find(query);
    return results.length > 0 ? results[0] : null;
  }

  async insertOne(doc: Omit<T, '_id'> & { _id?: string }): Promise<T> {
    const newDoc = {
      ...doc,
      _id: doc._id || `${this.name.toLowerCase().slice(0, 4)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: (doc as any).createdAt || new Date().toISOString(),
    } as unknown as T;
    this.docs.push(newDoc);
    return JSON.parse(JSON.stringify(newDoc));
  }

  async insertMany(docs: any[]): Promise<T[]> {
    const inserted: T[] = [];
    for (const d of docs) {
      const ins = await this.insertOne(d);
      inserted.push(ins);
    }
    return inserted;
  }

  async updateOne(filter: any, update: any): Promise<{ matchedCount: number; modifiedCount: number }> {
    const item = await this.findOne(filter);
    if (!item) return { matchedCount: 0, modifiedCount: 0 };
    const index = this.docs.findIndex(d => d._id === item._id);
    if (index === -1) return { matchedCount: 0, modifiedCount: 0 };

    let updated = { ...this.docs[index] };
    if (update.$set) {
      updated = { ...updated, ...update.$set };
    }
    if (update.$inc) {
      for (const [key, incVal] of Object.entries(update.$inc)) {
        (updated as any)[key] = ((updated as any)[key] || 0) + (incVal as number);
      }
    }
    if (update.$push) {
      for (const [key, val] of Object.entries(update.$push)) {
        if (!Array.isArray((updated as any)[key])) {
          (updated as any)[key] = [];
        }
        (updated as any)[key].push(val);
      }
    }
    this.docs[index] = updated;
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(filter: any): Promise<{ deletedCount: number }> {
    const item = await this.findOne(filter);
    if (!item) return { deletedCount: 0 };
    const prevLen = this.docs.length;
    this.docs = this.docs.filter(d => d._id !== item._id);
    return { deletedCount: prevLen - this.docs.length };
  }

  async countDocuments(filter: any = {}): Promise<number> {
    const res = await this.find(filter);
    return res.length;
  }

  reset(initialData: T[]) {
    this.docs = JSON.parse(JSON.stringify(initialData));
  }
}

class MongoEngine {
  client: MongoClient | null = null;
  db: Db | null = null;
  isNativeConnected = false;
  connectionUri: string;
  dbName: string;
  ready: Promise<void>;

  // Local MongoDB compatible collections
  localCollections: Record<CollectionName, InMemoryMongoCollection<any>> = {
    Customers: new InMemoryMongoCollection<Customer>('Customers', initialCustomers),
    Cars: new InMemoryMongoCollection<Car>('Cars', initialCars),
    Services: new InMemoryMongoCollection<Service>('Services', initialServices),
    Mechanics: new InMemoryMechanicCollection('Mechanics', initialMechanics) as any,
    SpareParts: new InMemoryMongoCollection<SparePart>('SpareParts', initialSpareParts),
    Bills: new InMemoryMongoCollection<Bill>('Bills', initialBills),
    ServiceHistory: new InMemoryMongoCollection<ServiceHistoryItem>('ServiceHistory', initialServiceHistory),
  };

  constructor() {
    this.connectionUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/car_service_db';
    this.dbName = process.env.MONGODB_DB_NAME || 'car_service_db';
    this.ready = this.initDatabase();
  }

  async initDatabase() {
    try {
      this.client = new MongoClient(this.connectionUri, {
        serverSelectionTimeoutMS: 1200,
        connectTimeoutMS: 1200,
      });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.isNativeConnected = true;
      console.log(`[MongoDB Engine] Successfully connected to native MongoDB at ${this.connectionUri}`);
      await this.ensureSeedDataInNative();
    } catch (err: any) {
      this.isNativeConnected = false;
      this.client = null;
      this.db = null;
      console.log(`[MongoDB Engine] Native mongod not reachable (${err?.message || 'timeout'}). Running high-performance local MongoDB engine.`);
    }
  }

  async ensureSeedDataInNative() {
    if (!this.db || !this.isNativeConnected) return;
    try {
      await this.seedDemoData(false, false);
    } catch (e) {
      console.error('[MongoDB Engine] Error seeding native MongoDB:', e);
    }
  }

  async seedDemoData(force = false, waitForReady = true): Promise<{ inserted: number; skipped: number; reset: boolean }> {
    if (waitForReady) {
      await this.ready;
    }
    const datasets: Array<[CollectionName, any[]]> = [
      ['Customers', initialCustomers],
      ['Cars', initialCars],
      ['Services', initialServices],
      ['Mechanics', initialMechanics],
      ['SpareParts', initialSpareParts],
      ['Bills', initialBills],
      ['ServiceHistory', initialServiceHistory],
    ];
    let inserted = 0;
    let skipped = 0;

    if (this.isNativeConnected && this.db) {
      if (force) {
        for (const [name] of datasets) {
          await this.db.collection(name).deleteMany({});
        }
      }
      for (const [name, docs] of datasets) {
        const collection = this.db.collection(name);
        for (const doc of docs) {
          const result = await collection.updateOne(
            { _id: doc._id },
            { $setOnInsert: doc },
            { upsert: true },
          );
          if (result.upsertedCount > 0) inserted += 1;
          else skipped += 1;
        }
      }
    } else {
      if (force) {
        for (const [name, docs] of datasets) {
          this.localCollections[name].reset(docs);
          inserted += docs.length;
        }
      } else {
        for (const [name, docs] of datasets) {
          const collection = this.localCollections[name];
          for (const doc of docs) {
            if (await collection.findOne({ _id: doc._id })) {
              skipped += 1;
            } else {
              await collection.insertOne(doc);
              inserted += 1;
            }
          }
        }
      }
    }

    if (inserted > 0) {
      console.log(`[MongoDB Engine] Seeded ${inserted} demo records (${skipped} already existed)`);
    }
    return { inserted, skipped, reset: force };
  }

  async close(): Promise<void> {
    await this.ready;
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isNativeConnected = false;
    }
  }

  getCollection<T extends { _id: string }>(name: CollectionName) {
    if (this.isNativeConnected && this.db) {
      const nativeCol = this.db.collection<T>(name);
      return {
        name,
        find: async (query: any = {}) => (await nativeCol.find(query).toArray()) as T[],
        findOne: async (query: any) => (await nativeCol.findOne(query)) as T | null,
        insertOne: async (doc: any) => {
          const insertedDoc = {
            ...doc,
            _id: doc._id || `${name.toLowerCase().slice(0, 4)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            createdAt: doc.createdAt || new Date().toISOString(),
          };
          await nativeCol.insertOne(insertedDoc as any);
          return insertedDoc as T;
        },
        insertMany: async (docs: any[]) => {
          const formatted = docs.map(d => ({
            ...d,
            _id: d._id || `${name.toLowerCase().slice(0, 4)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            createdAt: d.createdAt || new Date().toISOString(),
          }));
          await nativeCol.insertMany(formatted as any);
          return formatted as T[];
        },
        updateOne: async (filter: any, update: any) => {
          const res = await nativeCol.updateOne(filter, update);
          return { matchedCount: res.matchedCount, modifiedCount: res.modifiedCount };
        },
        deleteOne: async (filter: any) => {
          const res = await nativeCol.deleteOne(filter);
          return { deletedCount: res.deletedCount };
        },
        countDocuments: async (filter: any = {}) => {
          return await nativeCol.countDocuments(filter);
        },
      };
    }

    return this.localCollections[name];
  }

  async runAggregate(collectionName: CollectionName, pipeline: any[]): Promise<any[]> {
    if (this.isNativeConnected && this.db) {
      return await this.db.collection(collectionName).aggregate(pipeline).toArray();
    }

    // Run using Mingo on in-memory collection with multi-collection resolution
    const sourceData = this.localCollections[collectionName].docs;
    const agg = new Aggregator(pipeline, {
      collectionResolver: (name: string) => {
        // Resolve collection name flexibly (e.g. 'Cars', 'cars', 'Bills', 'bills')
        const matchedKey = Object.keys(this.localCollections).find(
          k => k.toLowerCase() === name.toLowerCase()
        ) as CollectionName | undefined;
        if (matchedKey) {
          return this.localCollections[matchedKey].docs;
        }
        return [];
      },
    });
    return agg.run(sourceData);
  }

  async resetData(): Promise<void> {
    if (this.isNativeConnected && this.db) {
      await this.db.collection('Customers').deleteMany({});
      await this.db.collection('Cars').deleteMany({});
      await this.db.collection('Services').deleteMany({});
      await this.db.collection('Mechanics').deleteMany({});
      await this.db.collection('SpareParts').deleteMany({});
      await this.db.collection('Bills').deleteMany({});
      await this.db.collection('ServiceHistory').deleteMany({});

      await this.db.collection('Customers').insertMany(initialCustomers as any);
      await this.db.collection('Cars').insertMany(initialCars as any);
      await this.db.collection('Services').insertMany(initialServices as any);
      await this.db.collection('Mechanics').insertMany(initialMechanics as any);
      await this.db.collection('SpareParts').insertMany(initialSpareParts as any);
      await this.db.collection('Bills').insertMany(initialBills as any);
      await this.db.collection('ServiceHistory').insertMany(initialServiceHistory as any);
    } else {
      this.localCollections.Customers.reset(initialCustomers);
      this.localCollections.Cars.reset(initialCars);
      this.localCollections.Services.reset(initialServices);
      this.localCollections.Mechanics.reset(initialMechanics);
      this.localCollections.SpareParts.reset(initialSpareParts);
      this.localCollections.Bills.reset(initialBills);
      this.localCollections.ServiceHistory.reset(initialServiceHistory);
    }
  }

  async getStatus() {
    const counts: Record<string, number> = {};
    const colNames: CollectionName[] = [
      'Customers',
      'Cars',
      'Services',
      'Mechanics',
      'SpareParts',
      'Bills',
      'ServiceHistory',
    ];

    for (const name of colNames) {
      const col = this.getCollection(name);
      counts[name] = await col.countDocuments({});
    }

    return {
      connected: this.isNativeConnected,
      engine: this.isNativeConnected ? 'Native MongoDB Server' : 'Embedded Local MongoDB Engine (Mingo Powered)',
      connectionUri: this.connectionUri,
      dbName: this.dbName,
      collections: counts,
      status: 'Ready',
      synopsisCompliance: {
        totalCollections: 7,
        aggregationPipelinesSupported: true,
        crudOperationsSupported: true,
        predictiveServiceIntervalSupported: true,
      },
    };
  }
}

// Subclass to ensure TypeScript clean typing
class InMemoryMechanicCollection extends InMemoryMongoCollection<Mechanic> {}

export const dbEngine = new MongoEngine();
