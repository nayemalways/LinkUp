/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookingStatus } from '../booking/booking.interface';
import Booking from '../booking/booking.model';
import Event from '../events/event.model';
import { SponsorStatus } from '../sponsored/sponsored.interface';
import { Sponsored } from '../sponsored/sponsored.model';
import User, { UserActivity } from '../users/user.model';

const last_week = new Date();
last_week.setDate(last_week.getDate() - 7); // Get the date 7 days ago

// DASHBOARD ANALYTICS
const dashboardStatsService = async () => {
  // TOTAL EVENT AND LAST WEEK PARCHENTAGE
  const eventPromise = Event.aggregate([
    {
      $facet: {
        total: [{ $count: 'totalEvents' }],
        lastWeek: [
          {
            $match: {
              createdAt: { $gte: last_week },
            },
          },
          { $count: 'lastWeekIncrease' },
        ],
      },
    },
    {
      $project: {
        totalEvents: {
          $ifNull: [{ $arrayElemAt: ['$total.totalEvents', 0] }, 0],
        },
        lastWeekIncrease: {
          $ifNull: [{ $arrayElemAt: ['$lastWeek.lastWeekIncrease', 0] }, 0],
        },
      },
    },
    {
      $project: {
        totalEvents: 1,
        lastWeekIncrease: 1,
        percentageIncreaseFromLastWeek: {
          $cond: [
            {
              $lte: [{ $subtract: ['$totalEvents', '$lastWeekIncrease'] }, 0],
            },
            100,
            {
              $multiply: [
                {
                  $divide: [
                    '$lastWeekIncrease',
                    {
                      $subtract: ['$totalEvents', '$lastWeekIncrease'],
                    },
                  ],
                },
                100,
              ],
            },
          ],
        },
      },
    },
  ]);

  // TOTAL USER AND LAST WEEK PARCHENTAGE
  const userPromise = User.aggregate([
    {
      $facet: {
        total: [{ $count: 'totalUser' }],
        lastWeek: [
          {
            $match: {
              createdAt: { $gte: last_week },
            },
          },
          { $count: 'lastWeekIncrease' },
        ],
      },
    },
    {
      $project: {
        totalUser: {
          $ifNull: [{ $arrayElemAt: ['$total.totalUser', 0] }, 0],
        },
        lastWeekIncrease: {
          $ifNull: [{ $arrayElemAt: ['$lastWeek.lastWeekIncrease', 0] }, 0],
        },
      },
    },
    {
      $project: {
        totalUser: 1,
        lastWeekIncrease: 1,
        percentageIncreaseFromLastWeek: {
          $cond: [
            {
              $lte: [{ $subtract: ['$totalUser', '$lastWeekIncrease'] }, 0],
            },
            100,
            {
              $multiply: [
                {
                  $divide: [
                    '$lastWeekIncrease',
                    {
                      $subtract: ['$totalUser', '$lastWeekIncrease'],
                    },
                  ],
                },
                100,
              ],
            },
          ],
        },
      },
    },
  ]);

  // TOTAL SPONSORED AND LAST WEEK PARCHENTAGE
  const sponsoredPromise = Sponsored.aggregate([
    {
      $facet: {
        total: [
          { $match: { sponsor_status: SponsorStatus.APPROVED } }, // Filter by SponsorStatus.APPROVED
          { $count: 'totalSponsored' },
        ],
        lastWeek: [
          {
            $match: {
              sponsor_status: SponsorStatus.APPROVED, // Filter by SponsorStatus.APPROVED
              createdAt: { $gte: last_week },
            },
          },
          { $count: 'lastWeekIncrease' },
        ],
      },
    },
    {
      $project: {
        totalSponsored: {
          $ifNull: [{ $arrayElemAt: ['$total.totalSponsored', 0] }, 0],
        },
        lastWeekIncrease: {
          $ifNull: [{ $arrayElemAt: ['$lastWeek.lastWeekIncrease', 0] }, 0],
        },
      },
    },
    {
      $project: {
        totalSponsored: 1,
        lastWeekIncrease: 1,
        percentageIncreaseFromLastWeek: {
          $cond: [
            {
              $lte: [
                { $subtract: ['$totalSponsored', '$lastWeekIncrease'] },
                0,
              ],
            },
            100,
            {
              $multiply: [
                {
                  $divide: [
                    '$lastWeekIncrease',
                    {
                      $subtract: ['$totalSponsored', '$lastWeekIncrease'],
                    },
                  ],
                },
                100,
              ],
            },
          ],
        },
      },
    },
  ]);

  // TOTAL REVENUE
  const revenuePromise = Booking.aggregate([
    {
      $match: {
        booking_status: BookingStatus.CONFIRMED,
      },
    },

    // join payments
    {
      $lookup: {
        from: 'payments',
        localField: 'payment',
        foreignField: '_id',
        as: 'payment',
      },
    },
    { $unwind: '$payment' },

    {
      $facet: {
        // 🔹 TOTAL REVENUE (all time)
        total: [
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: '$payment.transaction_amount',
              },
            },
          },
        ],

        // 🔹 LAST 7 DAYS REVENUE
        lastWeek: [
          {
            $match: {
              createdAt: { $gte: last_week },
            },
          },
          {
            $group: {
              _id: null,
              lastWeekRevenue: {
                $sum: '$payment.transaction_amount',
              },
            },
          },
        ],
      },
    },

    // flatten arrays
    {
      $project: {
        totalRevenue: {
          $ifNull: [{ $arrayElemAt: ['$total.totalRevenue', 0] }, 0],
        },
        lastWeekRevenue: {
          $ifNull: [{ $arrayElemAt: ['$lastWeek.lastWeekRevenue', 0] }, 0],
        },
      },
    },

    // calculate percentage
    {
      $project: {
        totalRevenue: 1,
        lastWeekRevenue: 1,
        percentageIncreaseFromLastWeek: {
          $cond: [
            {
              $lte: [{ $subtract: ['$totalRevenue', '$lastWeekRevenue'] }, 0],
            },
            100,
            {
              $multiply: [
                {
                  $divide: [
                    '$lastWeekRevenue',
                    {
                      $subtract: ['$totalRevenue', '$lastWeekRevenue'],
                    },
                  ],
                },
                100,
              ],
            },
          ],
        },
      },
    },
  ]);

  // TOP HOST & ORGANIZER AND REVENUE
  const hostStatsPromise = Event.aggregate([
    // Stage 1: Group events by host (event count)
    {
      $group: {
        _id: '$host',
        eventCount: { $sum: 1 },
      },
    },

    // Stage 2: Lookup confirmed bookings + payments for each host
    {
      $lookup: {
        from: 'bookings',
        let: { hostId: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'events',
              localField: 'event',
              foreignField: '_id',
              as: 'event',
            },
          },
          { $unwind: '$event' },
          {
            $match: {
              booking_status: BookingStatus.CONFIRMED,
              $expr: { $eq: ['$event.host', '$$hostId'] },
            },
          },
          {
            $lookup: {
              from: 'payments',
              localField: 'payment',
              foreignField: '_id',
              as: 'payment',
            },
          },
          { $unwind: '$payment' },
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: '$payment.transaction_amount',
              },
            },
          },
        ],
        as: 'revenue',
      },
    },

    // Stage 3: Flatten revenue
    {
      $addFields: {
        totalRevenue: {
          $ifNull: [{ $arrayElemAt: ['$revenue.totalRevenue', 0] }, 0],
        },
      },
    },

    // Stage 4: Join user info
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },

    // Stage 5: Final projection
    {
      $project: {
        eventCount: 1,
        totalRevenue: 1,
        'user.fullName': 1,
        'user.organizationName': 1,
      },
    },

    // Stage: 6 Sort by revenue or event count
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
  ]);

  // RESOLVE ALL PROMISES
  const [event, user, sponsored, hostStats, revenue] = await Promise.all([
    eventPromise,
    userPromise,
    sponsoredPromise,
    hostStatsPromise,
    revenuePromise,
  ]);

  return {
    stats: {
      revenueStats: revenue[0],
      user: user[0],
      event: event[0],
      sponsored: sponsored[0],
    },
    hostStats,
  };
};

const dailyUserActivityService = async (query: Record<string, string>) => {
  const { range = "weekly" } = query;
  const today = new Date();

  const match: any = {};
  let groupId: any;

  if (range === "weekly") {
    const start = new Date();
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    match.date = { $gte: start, $lte: end };

    groupId = {
      $dateToString: {
        format: "%Y-%m-%d",
        date: "$date",
        timezone: "+06:00" // 🔴 CRITICAL FIX
      }
    };
  }

  if (range === "monthly") {
    const year = today.getFullYear();
    match.date = {
      $gte: new Date(year, 0, 1),
      $lte: new Date(year, 11, 31, 23, 59, 59, 999)
    };

    groupId = {
      $dateToString: {
        format: "%Y-%m",
        date: "$date",
        timezone: "+06:00" // 🔴 CRITICAL FIX
      }
    };
  }

  const rawData = await UserActivity.aggregate([
    { $match: match },
    { $group: { _id: groupId, users: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // ---------------- WEEKLY ----------------
  if (range === "weekly") {
    const result: { day: string; users: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const key = `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;

      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      const found = rawData.find(r => r._id === key);
      result.push({ day: dayName, users: found ? found.users : 0 });
    }

    return result;
  }

  // ---------------- MONTHLY ----------------
  if (range === "monthly") {
    const result: { month: string; users: number }[] = [];

    for (let m = 0; m < 12; m++) {
      const d = new Date(today.getFullYear(), m, 1);
      const key = `${d.getFullYear()}-${(m + 1).toString().padStart(2, "0")}`;
      const monthName = d.toLocaleDateString("en-US", { month: "short" });

      const found = rawData.find(r => r._id === key);
      result.push({ month: monthName, users: found ? found.users : 0 });
    }

    return result;
  }

  return rawData;
};






export const dashboardService = {
  dashboardStatsService,
  dailyUserActivityService
};
