import type { Car, ServiceHistoryItem, HealthScoreBreakdown, PredictiveAlert, Customer, ServiceType } from '../src/types/index';
import { dbEngine } from './db';

/**
 * Deterministic, Explainable Vehicle Health Scoring & Service Interval Estimator.
 * Note: Uses arithmetic historical interval progression and physical vehicle degradation models.
 * Strictly non-ML; fully transparent and auditable.
 */

export function calculateVehicleHealthScore(
  car: Car,
  history: ServiceHistoryItem[]
): HealthScoreBreakdown {
  const currentYear = 2025; // Matching demo timeline
  const vehicleAge = Math.max(0, currentYear - car.year);
  const mileage = car.mileage || 0;

  let score = 100;
  const factors: HealthScoreBreakdown['factors'] = [];

  // 1. Base Score
  factors.push({
    factor: 'Baseline Factory Condition',
    impact: 100,
    description: 'Starting benchmark for a fully certified passenger vehicle.',
  });

  // 2. Mileage wear degradation
  // Every 10,000 km beyond 15,000 km incurs 1.5 points reduction
  const excessMileage10k = Math.max(0, (mileage - 15000) / 10000);
  const mileageDeduction = Math.min(25, Math.round(excessMileage10k * 1.5 * 10) / 10);
  if (mileageDeduction > 0) {
    score -= mileageDeduction;
    factors.push({
      factor: 'Odometer Wear & Tear',
      impact: -mileageDeduction,
      description: `Accumulated ${mileage.toLocaleString()} km across running components (-1.5 pts / 10,000 km).`,
    });
  }

  // 3. Vehicle Chronological Age
  // -2 points per year of age
  const ageDeduction = Math.min(15, vehicleAge * 2);
  if (ageDeduction > 0) {
    score -= ageDeduction;
    factors.push({
      factor: 'Chronological Component Aging',
      impact: -ageDeduction,
      description: `${vehicleAge} year(s) in operating service (-2.0 pts / year).`,
    });
  }

  // 4. Historical Maintenance Adherence
  if (history.length >= 2) {
    // Sort chronological
    const sorted = [...history].sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());
    let lateCount = 0;
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (curr.mileageAtService > prev.nextRecommendedMileage + 1500) {
        lateCount++;
      }
    }

    if (lateCount === 0) {
      score += 5; // Reward punctuality
      factors.push({
        factor: 'Punctual Service History Reward',
        impact: +5,
        description: 'All recorded services executed strictly within prescribed interval windows (+5.0 pts).',
      });
    } else {
      const latePenalty = Math.min(12, lateCount * 4);
      score -= latePenalty;
      factors.push({
        factor: 'Deferred Service Interval Penalty',
        impact: -latePenalty,
        description: `${lateCount} service(s) postponed beyond recommended distance threshold (-4.0 pts / occurrence).`,
      });
    }
  } else if (history.length === 1) {
    factors.push({
      factor: 'Single Verified Inspection Record',
      impact: 0,
      description: 'Baseline service documented; ongoing historical interval tracking initiated.',
    });
  } else {
    score -= 8;
    factors.push({
      factor: 'Unverified Prior Maintenance',
      impact: -8,
      description: 'Zero historical service logs in system database (-8.0 pts unverified history).',
    });
  }

  // 5. Major Component Repairs Check
  const majorRepairs = history.filter(h =>
    h.serviceType === 'Transmission Repair' ||
    h.serviceType === 'Engine Diagnostics' ||
    h.cost > 9000
  );
  if (majorRepairs.length > 0) {
    const repairPenalty = Math.min(10, majorRepairs.length * 3);
    score -= repairPenalty;
    factors.push({
      factor: 'Critical Subsystem Repairs Incident',
      impact: -repairPenalty,
      description: `${majorRepairs.length} major engine or transmission intervention(s) logged (-3.0 pts / event).`,
    });
  }

  // Clamp score between 25 and 100
  const finalScore = Math.min(100, Math.max(25, Math.round(score)));

  let category: HealthScoreBreakdown['category'] = 'Good';
  if (finalScore >= 90) category = 'Excellent';
  else if (finalScore >= 75) category = 'Good';
  else if (finalScore >= 60) category = 'Fair';
  else category = 'Critical';

  return {
    score: finalScore,
    category,
    factors,
    explanation: `Calculated deterministically from vehicle mileage (${car.mileage.toLocaleString()} km), age (${vehicleAge} yrs), and ${history.length} logged service events.`,
  };
}

export function estimateUpcomingService(
  car: Car,
  customer: Customer | undefined,
  history: ServiceHistoryItem[]
): PredictiveAlert {
  const health = calculateVehicleHealthScore(car, history);
  const now = new Date('2025-10-12T00:00:00Z'); // Current demo time baseline

  let avgDaysBetween = 180; // Standard 6-month baseline
  let avgDailyKm = 30; // 30 km / day standard urban rate
  let lastServiceDate = car.createdAt;
  let lastServiceMileage = car.mileage - 3500;

  if (history.length > 0) {
    const sorted = [...history].sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());
    const latest = sorted[sorted.length - 1];
    lastServiceDate = latest.serviceDate;
    lastServiceMileage = latest.mileageAtService;

    if (sorted.length >= 2) {
      const first = sorted[0];
      const diffMs = new Date(latest.serviceDate).getTime() - new Date(first.serviceDate).getTime();
      const diffDays = Math.max(30, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      avgDaysBetween = Math.round(diffDays / (sorted.length - 1));

      const kmDelta = Math.max(500, latest.mileageAtService - first.mileageAtService);
      avgDailyKm = Math.max(10, Math.round((kmDelta / diffDays) * 10) / 10);
    }
  }

  // Next service interval is typically: lastServiceDate + avgDaysBetween (or at 10,000 km interval)
  const lastServDateObj = new Date(lastServiceDate);
  const estimatedNextDateObj = new Date(lastServDateObj.getTime() + avgDaysBetween * 24 * 60 * 60 * 1000);
  const estimatedNextMileage = lastServiceMileage + Math.round(avgDaysBetween * avgDailyKm);

  const daysRemaining = Math.round((estimatedNextDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const kmRemaining = estimatedNextMileage - car.mileage;

  const isOverdue = daysRemaining < 0 || kmRemaining < 0;

  let alertLevel: PredictiveAlert['alertLevel'] = 'Normal';
  if (isOverdue) {
    alertLevel = 'Overdue';
  } else if (daysRemaining <= 30 || kmRemaining <= 1000) {
    alertLevel = 'Upcoming Soon';
  }

  // Suggest recommended service type based on vehicle mileage and health
  let recommendedServiceType: ServiceType = 'General Maintenance';
  if (car.mileage > 50000 && car.mileage % 40000 < 5000) {
    recommendedServiceType = 'Transmission Repair';
  } else if (health.score < 70) {
    recommendedServiceType = 'Brake System';
  } else if (car.mileage % 10000 < 2000) {
    recommendedServiceType = 'Oil & Filter Change';
  }

  return {
    carId: car._id,
    car,
    customer,
    currentMileage: car.mileage,
    healthScore: health,
    lastServiceDate,
    lastServiceMileage,
    avgDaysBetweenServices: avgDaysBetween,
    avgDailyMileage: avgDailyKm,
    estimatedNextServiceDate: estimatedNextDateObj.toISOString().split('T')[0],
    estimatedNextServiceMileage: estimatedNextMileage,
    isOverdue,
    daysRemaining,
    kmRemaining,
    recommendedServiceType,
    alertLevel,
  };
}

export async function getAllPredictiveAlerts(): Promise<PredictiveAlert[]> {
  const cars = await dbEngine.getCollection<Car>('Cars').find({});
  const customers = await dbEngine.getCollection<Customer>('Customers').find({});
  const allHistory = await dbEngine.getCollection<ServiceHistoryItem>('ServiceHistory').find({});

  const customerMap = new Map<string, Customer>();
  customers.forEach(c => customerMap.set(c._id, c));

  const historyByCar = new Map<string, ServiceHistoryItem[]>();
  allHistory.forEach(h => {
    if (!historyByCar.has(h.carId)) {
      historyByCar.set(h.carId, []);
    }
    historyByCar.get(h.carId)!.push(h);
  });

  return cars.map(car => {
    const cust = customerMap.get(car.customerId);
    const hist = historyByCar.get(car._id) || [];
    return estimateUpcomingService(car, cust, hist);
  });
}
