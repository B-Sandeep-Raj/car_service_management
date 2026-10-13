import { dbEngine } from './db';
import type { AggregationPipelineDoc } from '../src/types/index';

/**
 * MongoDB Aggregation Pipelines as specified in the project synopsis.
 * Each pipeline is structured with standard MongoDB stages:
 * $match, $lookup, $unwind, $group, $project, $sort, $limit
 */

export const pipelineDefinitions: Record<string, {
  title: string;
  description: string;
  collection: 'Services' | 'Bills' | 'Cars';
  pipeline: any[];
}> = {
  totalCompletedServices: {
    title: 'Completed Services & Revenue Overview',
    description: 'Calculates total completed services, overall revenue generated, and average labor hours.',
    collection: 'Services',
    pipeline: [
      {
        $match: {
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          totalCompletedServices: { $sum: 1 },
          totalRevenue: { $sum: '$actualCost' },
          avgCost: { $avg: '$actualCost' },
          avgLaborHours: { $avg: '$laborHours' },
          minCost: { $min: '$actualCost' },
          maxCost: { $max: '$actualCost' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCompletedServices: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          avgCost: { $round: ['$avgCost', 2] },
          avgLaborHours: { $round: ['$avgLaborHours', 2] },
          minCost: 1,
          maxCost: 1
        }
      }
    ]
  },

  frequentlyServicedBrands: {
    title: 'Frequently Serviced Vehicle Brands',
    description: 'Joins Services with Cars collection to identify which car brands arrive most frequently for maintenance.',
    collection: 'Services',
    pipeline: [
      {
        $lookup: {
          from: 'Cars',
          localField: 'carId',
          foreignField: '_id',
          as: 'carDetails'
        }
      },
      {
        $unwind: '$carDetails'
      },
      {
        $group: {
          _id: '$carDetails.brand',
          serviceCount: { $sum: 1 },
          totalRevenue: { $sum: '$actualCost' },
          avgCostPerService: { $avg: '$actualCost' }
        }
      },
      {
        $project: {
          brand: '$_id',
          serviceCount: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          avgCostPerService: { $round: ['$avgCostPerService', 2] }
        }
      },
      {
        $sort: { serviceCount: -1 }
      }
    ]
  },

  commonServiceTypes: {
    title: 'Distribution of Service Categories',
    description: 'Aggregates job orders by service category (e.g., Brake System, Engine Diagnostics, Oil Change).',
    collection: 'Services',
    pipeline: [
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          totalEstimated: { $sum: '$estimatedCost' },
          totalActual: { $sum: '$actualCost' },
          avgLaborHours: { $avg: '$laborHours' }
        }
      },
      {
        $project: {
          serviceType: '$_id',
          count: 1,
          totalActual: { $round: ['$totalActual', 2] },
          avgLaborHours: { $round: ['$avgLaborHours', 2] }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]
  },

  monthlyRevenueAndVolume: {
    title: 'Monthly Service Volume and Revenue Trend',
    description: 'Groups bills by invoice month to analyze billing volume and revenue trajectory.',
    collection: 'Bills',
    pipeline: [
      {
        $project: {
          // Extract YYYY-MM from createdAt
          monthYear: { $substr: ['$createdAt', 0, 7] },
          grandTotal: 1,
          partsTotal: 1,
          laborTotal: 1,
          paymentStatus: 1
        }
      },
      {
        $group: {
          _id: '$monthYear',
          totalRevenue: { $sum: '$grandTotal' },
          totalBills: { $sum: 1 },
          partsRevenue: { $sum: '$partsTotal' },
          laborRevenue: { $sum: '$laborTotal' },
          avgBillAmount: { $avg: '$grandTotal' }
        }
      },
      {
        $project: {
          month: '$_id',
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalBills: 1,
          partsRevenue: { $round: ['$partsRevenue', 2] },
          laborRevenue: { $round: ['$laborRevenue', 2] },
          avgBillAmount: { $round: ['$avgBillAmount', 2] }
        }
      },
      {
        $sort: { month: 1 }
      }
    ]
  },

  averageServiceCost: {
    title: 'Average Service Cost by Service Type',
    description: 'Evaluates the average economic ticket size across service varieties.',
    collection: 'Services',
    pipeline: [
      {
        $match: {
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: '$serviceType',
          averageCost: { $avg: '$actualCost' },
          completedJobs: { $sum: 1 }
        }
      },
      {
        $project: {
          serviceType: '$_id',
          averageCost: { $round: ['$averageCost', 2] },
          completedJobs: 1
        }
      },
      {
        $sort: { averageCost: -1 }
      }
    ]
  },

  sparePartsDemand: {
    title: 'Spare Parts Consumption & Demand Analysis',
    description: 'Unwinds nested partsUsed array to compute part replacement frequency and inventory turnover.',
    collection: 'Services',
    pipeline: [
      {
        $unwind: '$partsUsed'
      },
      {
        $group: {
          _id: '$partsUsed.partName',
          partId: { $first: '$partsUsed.partId' },
          totalUnitsUsed: { $sum: '$partsUsed.quantity' },
          totalRevenueGenerated: {
            $sum: { $multiply: ['$partsUsed.quantity', '$partsUsed.unitPrice'] }
          }
        }
      },
      {
        $project: {
          partName: '$_id',
          partId: 1,
          totalUnitsUsed: 1,
          totalRevenueGenerated: { $round: ['$totalRevenueGenerated', 2] }
        }
      },
      {
        $sort: { totalUnitsUsed: -1 }
      },
      {
        $limit: 10
      }
    ]
  },

  mechanicPerformance: {
    title: 'Mechanic Workload & Efficiency Analysis',
    description: 'Joins Services with Mechanics collection to compute completed tasks, ratings, and total revenue credited.',
    collection: 'Services',
    pipeline: [
      {
        $lookup: {
          from: 'Mechanics',
          localField: 'mechanicId',
          foreignField: '_id',
          as: 'mechanic'
        }
      },
      {
        $unwind: '$mechanic'
      },
      {
        $group: {
          _id: '$mechanic._id',
          mechanicName: { $first: '$mechanic.name' },
          specialty: { $first: '$mechanic.specialty' },
          rating: { $first: '$mechanic.rating' },
          totalServicesAssigned: { $sum: 1 },
          completedJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          totalLaborHours: { $sum: '$laborHours' },
          totalRevenueGenerated: { $sum: '$actualCost' }
        }
      },
      {
        $project: {
          mechanicName: 1,
          specialty: 1,
          rating: 1,
          totalServicesAssigned: 1,
          completedJobs: 1,
          totalLaborHours: { $round: ['$totalLaborHours', 2] },
          totalRevenueGenerated: { $round: ['$totalRevenueGenerated', 2] }
        }
      },
      {
        $sort: { completedJobs: -1 }
      }
    ]
  },

  customerServiceFrequency: {
    title: 'Customer Service Frequency & Loyalty',
    description: 'Measures how many times each customer has serviced their vehicle fleet.',
    collection: 'Services',
    pipeline: [
      {
        $group: {
          _id: '$customerId',
          visitCount: { $sum: 1 },
          totalSpend: { $sum: '$actualCost' }
        }
      },
      {
        $lookup: {
          from: 'Customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $project: {
          customerName: '$customer.name',
          tier: '$customer.membershipTier',
          visitCount: 1,
          totalSpend: { $round: ['$totalSpend', 2] }
        }
      },
      {
        $sort: { visitCount: -1 }
      }
    ]
  },

  serviceStatusPipeline: {
    title: 'Current Workshop Service Status Pipeline',
    description: 'Counts active jobs across the 5 stages: Pending, In Progress, Awaiting Parts, Completed, Cancelled.',
    collection: 'Services',
    pipeline: [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          estimatedValue: { $sum: '$estimatedCost' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          estimatedValue: { $round: ['$estimatedValue', 2] }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]
  }
};

export async function executeAllAggregations(): Promise<AggregationPipelineDoc[]> {
  const results: AggregationPipelineDoc[] = [];

  for (const [key, def] of Object.entries(pipelineDefinitions)) {
    try {
      const data = await dbEngine.runAggregate(def.collection, def.pipeline);
      results.push({
        key,
        title: def.title,
        description: def.description,
        pipeline: def.pipeline,
        data,
      });
    } catch (err: any) {
      console.error(`Error running aggregation ${key}:`, err);
      results.push({
        key,
        title: def.title,
        description: def.description,
        pipeline: def.pipeline,
        data: [],
      });
    }
  }

  return results;
}
