import express, { Request, Response, Router } from 'express';
import { dbEngine, CollectionName } from './db';
import { executeAllAggregations, pipelineDefinitions } from './aggregations';
import { getAllPredictiveAlerts, estimateUpcomingService } from './healthScore';
import type { Customer, Car, Service, Mechanic, SparePart, Bill, ServiceHistoryItem } from '../src/types/index';

export const apiRouter = Router();

apiRouter.use(express.json());

// 1. System & Database Health
apiRouter.get('/db-status', async (_req: Request, res: Response) => {
  try {
    const status = await dbEngine.getStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/db-reset', async (_req: Request, res: Response) => {
  try {
    await dbEngine.resetData();
    res.json({ message: 'Database reset to default demo records successfully', success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Customers Endpoints
apiRouter.get('/customers', async (req: Request, res: Response) => {
  try {
    const { search, tier } = req.query;
    let query: any = {};
    if (tier && typeof tier === 'string' && tier !== 'All') {
      query.membershipTier = tier;
    }
    const collection = dbEngine.getCollection<Customer>('Customers');
    let customers = await collection.find(query);

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }

    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/customers', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address, membershipTier } = req.body;
    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Name, phone, and email are required.' });
    }
    const collection = dbEngine.getCollection<Customer>('Customers');
    const newCustomer = await collection.insertOne({
      name,
      phone,
      email,
      address: address || '',
      membershipTier: membershipTier || 'Standard',
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(newCustomer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/customers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, membershipTier } = req.body;
    const collection = dbEngine.getCollection<Customer>('Customers');
    const updateResult = await collection.updateOne(
      { _id: id },
      { $set: { name, phone, email, address, membershipTier } }
    );
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const updated = await collection.findOne({ _id: id });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/customers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = dbEngine.getCollection<Customer>('Customers');
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully', success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Cars Endpoints
apiRouter.get('/cars', async (req: Request, res: Response) => {
  try {
    const { search, customerId, brand } = req.query;
    let query: any = {};
    if (customerId && typeof customerId === 'string') {
      query.customerId = customerId;
    }
    if (brand && typeof brand === 'string' && brand !== 'All') {
      query.brand = brand;
    }
    const collection = dbEngine.getCollection<Car>('Cars');
    let cars = await collection.find(query);

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      cars = cars.filter(c =>
        c.licensePlate.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.vin.toLowerCase().includes(q)
      );
    }

    res.json(cars);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/cars', async (req: Request, res: Response) => {
  try {
    const { licensePlate, brand, model, year, vin, fuelType, mileage, customerId } = req.body;
    if (!licensePlate || !brand || !model || !customerId) {
      return res.status(400).json({ error: 'License plate, brand, model, and customer are required.' });
    }
    const collection = dbEngine.getCollection<Car>('Cars');
    const newCar = await collection.insertOne({
      licensePlate: licensePlate.toUpperCase(),
      brand,
      model,
      year: Number(year) || new Date().getFullYear(),
      vin: (vin || `VIN${Date.now()}`).toUpperCase(),
      fuelType: fuelType || 'Petrol',
      mileage: Number(mileage) || 0,
      customerId,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(newCar);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/cars/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { licensePlate, brand, model, year, vin, fuelType, mileage, customerId } = req.body;
    const collection = dbEngine.getCollection<Car>('Cars');
    const updateResult = await collection.updateOne(
      { _id: id },
      {
        $set: {
          licensePlate: licensePlate ? licensePlate.toUpperCase() : undefined,
          brand,
          model,
          year: year ? Number(year) : undefined,
          vin: vin ? vin.toUpperCase() : undefined,
          fuelType,
          mileage: mileage !== undefined ? Number(mileage) : undefined,
          customerId,
        },
      }
    );
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    const updated = await collection.findOne({ _id: id });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/cars/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = dbEngine.getCollection<Car>('Cars');
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json({ message: 'Car deleted successfully', success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Services Endpoints
apiRouter.get('/services', async (req: Request, res: Response) => {
  try {
    const { status, priority, carId, customerId } = req.query;
    let query: any = {};
    if (status && typeof status === 'string' && status !== 'All') {
      query.status = status;
    }
    if (priority && typeof priority === 'string' && priority !== 'All') {
      query.priority = priority;
    }
    if (carId && typeof carId === 'string') {
      query.carId = carId;
    }
    if (customerId && typeof customerId === 'string') {
      query.customerId = customerId;
    }

    const collection = dbEngine.getCollection<Service>('Services');
    const services = await collection.find(query);
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/services', async (req: Request, res: Response) => {
  try {
    const {
      carId,
      customerId,
      mechanicId,
      serviceType,
      description,
      status,
      priority,
      estimatedCost,
      actualCost,
      partsUsed,
      laborHours,
      startDate,
    } = req.body;

    if (!carId || !serviceType) {
      return res.status(400).json({ error: 'Car ID and Service Type are required.' });
    }

    // Auto-resolve customer if not provided
    let finalCustomerId = customerId;
    if (!finalCustomerId) {
      const car = await dbEngine.getCollection<Car>('Cars').findOne({ _id: carId });
      if (car) finalCustomerId = car.customerId;
    }

    const collection = dbEngine.getCollection<Service>('Services');
    const newService = await collection.insertOne({
      carId,
      customerId: finalCustomerId,
      mechanicId: mechanicId || 'mech_01',
      serviceType,
      description: description || `${serviceType} inspection`,
      status: status || 'Pending',
      priority: priority || 'Medium',
      estimatedCost: Number(estimatedCost) || 0,
      actualCost: Number(actualCost) || 0,
      partsUsed: Array.isArray(partsUsed) ? partsUsed : [],
      laborHours: Number(laborHours) || 1,
      startDate: startDate || new Date().toISOString(),
      healthScoreBefore: 80,
      healthScoreAfter: 95,
      createdAt: new Date().toISOString(),
    });

    // Deduct stock if parts were used
    if (Array.isArray(partsUsed) && partsUsed.length > 0) {
      const partsCol = dbEngine.getCollection<SparePart>('SpareParts');
      for (const p of partsUsed) {
        if (p.partId && p.quantity) {
          await partsCol.updateOne({ _id: p.partId }, { $inc: { stockQuantity: -p.quantity } });
        }
      }
    }

    res.status(201).json(newService);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/services/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;

    const collection = dbEngine.getCollection<Service>('Services');
    const updateResult = await collection.updateOne({ _id: id }, { $set: updateData });
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    const updated = await collection.findOne({ _id: id });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.patch('/services/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const collection = dbEngine.getCollection<Service>('Services');
    const service = await collection.findOne({ _id: id });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const updateSet: any = { status };
    if (status === 'Completed' && !service.completedDate) {
      updateSet.completedDate = new Date().toISOString();
      if (!service.actualCost || service.actualCost === 0) {
        // Calculate parts + labor
        const partsCost = service.partsUsed.reduce((sum: number, p: any) => sum + (p.quantity * p.unitPrice), 0);
        const laborCost = service.laborHours * 800; // 800 per hr
        updateSet.actualCost = partsCost + laborCost;
      }
    }

    await collection.updateOne({ _id: id }, { $set: updateSet });
    const updated = await collection.findOne({ _id: id });

    // Auto-create bill if completed and not billed yet
    if (status === 'Completed' && updated) {
      const billsCol = dbEngine.getCollection<Bill>('Bills');
      const existingBill = await billsCol.findOne({ serviceId: id });
      if (!existingBill) {
        const partsTotal = updated.partsUsed.reduce((sum: number, p: any) => sum + (p.quantity * p.unitPrice), 0);
        const laborTotal = updated.laborHours * 800;
        const subtotal = partsTotal + laborTotal;
        const taxAmount = Math.round(subtotal * 0.18); // 18% GST
        const discountAmount = Math.round(subtotal * 0.05); // 5% standard discount
        const grandTotal = subtotal + taxAmount - discountAmount;

        await billsCol.insertOne({
          billNumber: `INV-2025-${Math.floor(100 + Math.random() * 900)}`,
          serviceId: id,
          carId: updated.carId,
          customerId: updated.customerId,
          partsTotal,
          laborTotal,
          taxAmount,
          discountAmount,
          grandTotal,
          paymentStatus: 'Unpaid',
          paymentMethod: 'Card',
          createdAt: new Date().toISOString(),
        });
      }

      // Add to ServiceHistory if completed
      const histCol = dbEngine.getCollection<ServiceHistoryItem>('ServiceHistory');
      const existingHist = await histCol.findOne({ serviceId: id });
      if (!existingHist) {
        const car = await dbEngine.getCollection<Car>('Cars').findOne({ _id: updated.carId });
        const mech = await dbEngine.getCollection<Mechanic>('Mechanics').findOne({ _id: updated.mechanicId });
        const currentCarMileage = car?.mileage || 50000;

        await histCol.insertOne({
          carId: updated.carId,
          serviceId: id,
          serviceDate: new Date().toISOString().split('T')[0],
          mileageAtService: currentCarMileage,
          serviceType: updated.serviceType,
          summary: updated.description,
          cost: updated.actualCost,
          mechanicName: mech?.name || 'Lead Master Tech',
          nextRecommendedDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          nextRecommendedMileage: currentCarMileage + 10000,
          healthScore: 95,
        });
      }
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/services/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = dbEngine.getCollection<Service>('Services');
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Service deleted successfully', success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Mechanics Endpoints
apiRouter.get('/mechanics', async (_req: Request, res: Response) => {
  try {
    const collection = dbEngine.getCollection<Mechanic>('Mechanics');
    const mechanics = await collection.find({});
    res.json(mechanics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/mechanics', async (req: Request, res: Response) => {
  try {
    const { name, specialty, experienceYears, rating, phone, email, status } = req.body;
    if (!name || !specialty) {
      return res.status(400).json({ error: 'Name and specialty are required.' });
    }
    const collection = dbEngine.getCollection<Mechanic>('Mechanics');
    const newMechanic = await collection.insertOne({
      name,
      specialty,
      experienceYears: Number(experienceYears) || 1,
      rating: Number(rating) || 4.5,
      phone: phone || '',
      email: email || '',
      status: status || 'Available',
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(newMechanic);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/mechanics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, specialty, experienceYears, rating, phone, email, status } = req.body;
    const collection = dbEngine.getCollection<Mechanic>('Mechanics');
    const updateResult = await collection.updateOne(
      { _id: id },
      {
        $set: {
          name,
          specialty,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
          rating: rating ? Number(rating) : undefined,
          phone,
          email,
          status,
        },
      }
    );
    if (updateResult.matchedCount === 0) return res.status(404).json({ error: 'Mechanic not found' });
    const updated = await collection.findOne({ _id: id });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/mechanics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = dbEngine.getCollection<Mechanic>('Mechanics');
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Mechanic not found' });
    res.json({ message: 'Mechanic removed successfully', success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Spare Parts Endpoints
apiRouter.get('/spare-parts', async (req: Request, res: Response) => {
  try {
    const { category, lowStock, search } = req.query;
    let query: any = {};
    if (category && typeof category === 'string' && category !== 'All') {
      query.category = category;
    }
    const collection = dbEngine.getCollection<SparePart>('SpareParts');
    let parts = await collection.find(query);

    if (lowStock === 'true') {
      parts = parts.filter(p => p.stockQuantity <= p.minimumStockLevel);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      parts = parts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q)
      );
    }

    res.json(parts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/spare-parts', async (req: Request, res: Response) => {
  try {
    const { partNumber, name, category, costPrice, sellingPrice, stockQuantity, minimumStockLevel, unit, supplier } = req.body;
    if (!partNumber || !name || !category) {
      return res.status(400).json({ error: 'Part number, name, and category are required.' });
    }
    const collection = dbEngine.getCollection<SparePart>('SpareParts');
    const newPart = await collection.insertOne({
      partNumber: partNumber.toUpperCase(),
      name,
      category,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      minimumStockLevel: Number(minimumStockLevel) || 5,
      unit: unit || 'Piece',
      supplier: supplier || 'OEM Supplier',
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(newPart);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/spare-parts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { partNumber, name, category, costPrice, sellingPrice, stockQuantity, minimumStockLevel, unit, supplier } = req.body;
    const collection = dbEngine.getCollection<SparePart>('SpareParts');
    const updateResult = await collection.updateOne(
      { _id: id },
      {
        $set: {
          partNumber: partNumber ? partNumber.toUpperCase() : undefined,
          name,
          category,
          costPrice: costPrice !== undefined ? Number(costPrice) : undefined,
          sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : undefined,
          stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : undefined,
          minimumStockLevel: minimumStockLevel !== undefined ? Number(minimumStockLevel) : undefined,
          unit,
          supplier,
        },
      }
    );
    if (updateResult.matchedCount === 0) return res.status(404).json({ error: 'Part not found' });
    const updated = await collection.findOne({ _id: id });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.patch('/spare-parts/:id/stock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adjustment, newQuantity } = req.body;
    const collection = dbEngine.getCollection<SparePart>('SpareParts');
    const part = await collection.findOne({ _id: id });
    if (!part) return res.status(404).json({ error: 'Part not found' });

    let updatedQuantity = part.stockQuantity;
    if (typeof newQuantity === 'number') {
      updatedQuantity = Math.max(0, newQuantity);
    } else if (typeof adjustment === 'number') {
      updatedQuantity = Math.max(0, part.stockQuantity + adjustment);
    }

    await collection.updateOne({ _id: id }, { $set: { stockQuantity: updatedQuantity } });
    const updated = await collection.findOne({ _id: id });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/spare-parts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = dbEngine.getCollection<SparePart>('SpareParts');
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Part not found' });
    res.json({ message: 'Part deleted successfully', success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Bills & Revenue Endpoints
apiRouter.get('/bills', async (req: Request, res: Response) => {
  try {
    const { paymentStatus, customerId } = req.query;
    let query: any = {};
    if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }
    if (customerId && typeof customerId === 'string') {
      query.customerId = customerId;
    }
    const collection = dbEngine.getCollection<Bill>('Bills');
    const bills = await collection.find(query);
    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/bills', async (req: Request, res: Response) => {
  try {
    const { serviceId, carId, customerId, partsTotal, laborTotal, taxAmount, discountAmount, grandTotal, paymentStatus, paymentMethod } = req.body;
    if (!serviceId || !customerId) {
      return res.status(400).json({ error: 'Service ID and Customer ID are required.' });
    }
    const collection = dbEngine.getCollection<Bill>('Bills');
    const newBill = await collection.insertOne({
      billNumber: `INV-2025-${Math.floor(100 + Math.random() * 900)}`,
      serviceId,
      carId: carId || '',
      customerId,
      partsTotal: Number(partsTotal) || 0,
      laborTotal: Number(laborTotal) || 0,
      taxAmount: Number(taxAmount) || 0,
      discountAmount: Number(discountAmount) || 0,
      grandTotal: Number(grandTotal) || 0,
      paymentStatus: paymentStatus || 'Unpaid',
      paymentMethod: paymentMethod || 'Card',
      paidDate: paymentStatus === 'Paid' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(newBill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.patch('/bills/:id/pay', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentStatus } = req.body;
    const collection = dbEngine.getCollection<Bill>('Bills');
    const bill = await collection.findOne({ _id: id });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    const status = paymentStatus || 'Paid';
    await collection.updateOne(
      { _id: id },
      {
        $set: {
          paymentStatus: status,
          paymentMethod: paymentMethod || bill.paymentMethod,
          paidDate: status === 'Paid' ? new Date().toISOString() : undefined,
        },
      }
    );
    const updated = await collection.findOne({ _id: id });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/bills/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = dbEngine.getCollection<Bill>('Bills');
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Bill not found' });
    res.json({ message: 'Bill deleted successfully', success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Service History Endpoints
apiRouter.get('/service-history', async (req: Request, res: Response) => {
  try {
    const { carId } = req.query;
    let query: any = {};
    if (carId && typeof carId === 'string') {
      query.carId = carId;
    }
    const collection = dbEngine.getCollection<ServiceHistoryItem>('ServiceHistory');
    const history = await collection.find(query);
    // sort descending by serviceDate
    history.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/service-history', async (req: Request, res: Response) => {
  try {
    const { carId, serviceId, serviceDate, mileageAtService, serviceType, summary, cost, mechanicName, nextRecommendedDate, nextRecommendedMileage, healthScore } = req.body;
    if (!carId || !serviceType) {
      return res.status(400).json({ error: 'Car ID and Service Type are required.' });
    }
    const collection = dbEngine.getCollection<ServiceHistoryItem>('ServiceHistory');
    const newItem = await collection.insertOne({
      carId,
      serviceId: serviceId || `srv_${Date.now()}`,
      serviceDate: serviceDate || new Date().toISOString().split('T')[0],
      mileageAtService: Number(mileageAtService) || 0,
      serviceType,
      summary: summary || '',
      cost: Number(cost) || 0,
      mechanicName: mechanicName || 'Master Tech',
      nextRecommendedDate: nextRecommendedDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextRecommendedMileage: Number(nextRecommendedMileage) || (Number(mileageAtService) + 10000),
      healthScore: Number(healthScore) || 90,
    });
    res.status(201).json(newItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Predictive Service & Health Alerts
apiRouter.get('/predictions/all', async (_req: Request, res: Response) => {
  try {
    const alerts = await getAllPredictiveAlerts();
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/predictions/car/:carId', async (req: Request, res: Response) => {
  try {
    const { carId } = req.params;
    const car = await dbEngine.getCollection<Car>('Cars').findOne({ _id: carId });
    if (!car) return res.status(404).json({ error: 'Car not found' });
    const customer = await dbEngine.getCollection<Customer>('Customers').findOne({ _id: car.customerId });
    const history = await dbEngine.getCollection<ServiceHistoryItem>('ServiceHistory').find({ carId });
    const alert = estimateUpcomingService(car, customer || undefined, history);
    res.json(alert);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. MongoDB Aggregation Analytics
apiRouter.get('/analytics/aggregations', async (_req: Request, res: Response) => {
  try {
    const aggregatedResults = await executeAllAggregations();
    res.json(aggregatedResults);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Custom Aggregation Pipeline Sandbox (Educational / Inspection feature)
apiRouter.post('/analytics/custom-pipeline', async (req: Request, res: Response) => {
  try {
    const { collectionName, pipeline } = req.body;
    if (!collectionName || !Array.isArray(pipeline)) {
      return res.status(400).json({ error: 'Valid collectionName and pipeline array required.' });
    }
    const result = await dbEngine.runAggregate(collectionName as CollectionName, pipeline);
    res.json({ success: true, count: result.length, result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
