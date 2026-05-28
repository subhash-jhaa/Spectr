import { prisma } from '@/lib/prisma';
import { 
  DatabaseEvent, 
  EventWithProject, 
  EventFilters, 
  QueryOptions, 
  CreateResult, 
  UpdateResult, 
  DeleteResult, 
  QueryResult,
  RealtimeVisitor,
  RealtimeStats,
  DailyStats,
  CountryStats,
  ReferrerStats,
  PageStats,
  BrowserStats,
  DeviceStats,
  VisitorStats
} from '../interfaces/database';

export class EventQueries {
  /**
   * Find an event by ID
   */
  static async findById(id: string): Promise<QueryResult<DatabaseEvent>> {
    try {
      const event = await prisma.event.findUnique({
        where: { id }
      });

      return {
        success: true,
        data: event || undefined
      };
    } catch (error) {
      console.error('Error finding event by ID:', error);
      return {
        success: false,
        error: 'Failed to find event'
      };
    }
  }

  /**
   * Find events with filters
   */
  static async findMany(
    filters: EventFilters = {}, 
    options: QueryOptions = {}
  ): Promise<QueryResult<DatabaseEvent[]>> {
    try {
      const where: any = {};
      
      if (filters.id) where.id = filters.id;
      if (filters.projectId) where.projectId = filters.projectId;
      if (filters.sessionId) where.sessionId = filters.sessionId;
      if (filters.ip) where.ip = filters.ip;
      if (filters.country) where.country = filters.country;
      if (filters.city) where.city = filters.city;
      if (filters.pageUrl) where.pageUrl = { contains: filters.pageUrl, mode: 'insensitive' };
      if (filters.timestamp) where.timestamp = filters.timestamp;

      const events = await prisma.event.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy || { timestamp: 'desc' },
        include: options.include
      });

      return {
        success: true,
        data: events,
        count: events.length
      };
    } catch (error) {
      console.error('Error finding events:', error);
      return {
        success: false,
        error: 'Failed to find events'
      };
    }
  }

  /**
   * Find events by project ID
   */
  static async findByProjectId(projectId: string, options: QueryOptions = {}): Promise<QueryResult<DatabaseEvent[]>> {
    try {
      const events = await prisma.event.findMany({
        where: { projectId },
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy || { timestamp: 'desc' },
        include: options.include
      });

      return {
        success: true,
        data: events,
        count: events.length
      };
    } catch (error) {
      console.error('Error finding events by project ID:', error);
      return {
        success: false,
        error: 'Failed to find events'
      };
    }
  }

  /**
   * Find recent events for real-time stats
   */
  static async findRecentEvents(projectId: string, minutesAgo: number): Promise<QueryResult<DatabaseEvent[]>> {
    try {
      const timeThreshold = new Date(Date.now() - minutesAgo * 60 * 1000);
      
      const events = await prisma.event.findMany({
        where: {
          projectId,
          timestamp: {
            gte: timeThreshold
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 100
      });

      return {
        success: true,
        data: events,
        count: events.length
      };
    } catch (error) {
      console.error('Error finding recent events:', error);
      return {
        success: false,
        error: 'Failed to find recent events'
      };
    }
  }

  /**
   * Find events in time range
   */
  static async findInTimeRange(
    projectId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<QueryResult<DatabaseEvent[]>> {
    try {
      const events = await prisma.event.findMany({
        where: {
          projectId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { timestamp: 'desc' }
      });

      return {
        success: true,
        data: events,
        count: events.length
      };
    } catch (error) {
      console.error('Error finding events in time range:', error);
      return {
        success: false,
        error: 'Failed to find events in time range'
      };
    }
  }

  /**
   * Find recent event by session
   */
  static async findRecentBySession(
    projectId: string, 
    sessionId: string, 
    minutesAgo: number
  ): Promise<QueryResult<DatabaseEvent>> {
    try {
      const timeThreshold = new Date(Date.now() - minutesAgo * 60 * 1000);
      
      const event = await prisma.event.findFirst({
        where: {
          projectId,
          sessionId,
          timestamp: {
            gte: timeThreshold
          }
        },
        orderBy: { timestamp: 'desc' }
      });

      return {
        success: true,
        data: event || undefined
      };
    } catch (error) {
      console.error('Error finding recent event by session:', error);
      return {
        success: false,
        error: 'Failed to find recent event'
      };
    }
  }

  /**
   * Create a new event
   */
  static async create(eventData: Partial<DatabaseEvent>): Promise<CreateResult<DatabaseEvent>> {
    try {
      const event = await prisma.event.create({
        data: eventData as any
      });

      return {
        success: true,
        data: event
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: 'Failed to create event'
      };
    }
  }

  /**
   * Update an event
   */
  static async update(
    id: string, 
    eventData: Partial<DatabaseEvent>
  ): Promise<UpdateResult<DatabaseEvent>> {
    try {
      const event = await prisma.event.update({
        where: { id },
        data: eventData
      });

      return {
        success: true,
        data: event,
        updated: true
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return {
        success: false,
        error: 'Failed to update event',
        updated: false
      };
    }
  }

  /**
   * Delete an event
   */
  static async delete(id: string): Promise<DeleteResult> {
    try {
      await prisma.event.delete({
        where: { id }
      });

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting event:', error);
      return {
        success: false,
        error: 'Failed to delete event'
      };
    }
  }

  /**
   * Get real-time visitor stats
   */
  static async getRealtimeStats(projectId: string, minutesAgo: number = 1): Promise<QueryResult<RealtimeStats>> {
    try {
      const result = await this.findRecentEvents(projectId, minutesAgo);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Failed to get real-time stats'
        };
      }

      // Group by unique sessions (preferred) or IPs (fallback)
      const uniqueVisitors = new Set();
      const visitorDetails: RealtimeVisitor[] = [];

      result.data.forEach(event => {
        const visitorKey = event.sessionId || event.ip;
        
        if (!uniqueVisitors.has(visitorKey)) {
          uniqueVisitors.add(visitorKey);
          visitorDetails.push({
            id: event.id,
            pageUrl: event.pageUrl,
            referrer: event.referrer,
            country: event.country,
            city: event.city,
            userAgent: event.userAgent,
            timestamp: event.timestamp,
            sessionId: event.sessionId,
            ip: event.ip
          });
        }
      });

      return {
        success: true,
        data: {
          count: uniqueVisitors.size,
          visitors: visitorDetails
        }
      };
    } catch (error) {
      console.error('Error getting real-time stats:', error);
      return {
        success: false,
        error: 'Failed to get real-time stats'
      };
    }
  }

  /**
   * Get daily visitor stats
   */
  static async getDailyStats(projectId: string, days: number = 7): Promise<QueryResult<DailyStats[]>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const stats = await prisma.$queryRaw<any[]>`
        SELECT 
          TO_CHAR(DATE_TRUNC('day', "timestamp"), 'YYYY-MM-DD') AS "date",
          COUNT(DISTINCT COALESCE("sessionId", "ip"))::integer AS "visitors",
          COUNT(*)::integer AS "pageViews"
        FROM "Event"
        WHERE "projectId" = ${projectId} AND "timestamp" >= ${startDate}
        GROUP BY DATE_TRUNC('day', "timestamp")
        ORDER BY DATE_TRUNC('day', "timestamp") ASC
      `;

      // Initialize daily stats with 0
      const dailyStatsMap: { [key: string]: DailyStats } = {};
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyStatsMap[dateKey] = {
          date: dateKey,
          visitors: 0,
          pageViews: 0
        };
      }

      // Merge query results
      stats.forEach((row: any) => {
        if (dailyStatsMap[row.date]) {
          dailyStatsMap[row.date].visitors = row.visitors;
          dailyStatsMap[row.date].pageViews = row.pageViews;
        } else {
          dailyStatsMap[row.date] = {
            date: row.date,
            visitors: row.visitors,
            pageViews: row.pageViews
          };
        }
      });

      const chartData = Object.values(dailyStatsMap).sort((a, b) => a.date.localeCompare(b.date));

      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return {
        success: false,
        error: 'Failed to get daily stats'
      };
    }
  }

  /**
   * Get country stats
   */
  static async getCountryStats(projectId: string, days: number = 30): Promise<QueryResult<CountryStats[]>> {
    try {
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const groups = await prisma.event.groupBy({
        by: ['country'],
        where: {
          projectId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          _all: true
        }
      });

      const totalVisitors = groups.reduce((sum, g) => sum + g._count._all, 0);
      
      const chartData: CountryStats[] = groups.map(g => ({
        country: g.country || 'Unknown',
        visitors: g._count._all,
        percentage: totalVisitors > 0 ? (g._count._all / totalVisitors) * 100 : 0
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);

      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      console.error('Error getting country stats:', error);
      return {
        success: false,
        error: 'Failed to get country stats'
      };
    }
  }

  /**
   * Get referrer stats
   */
  static async getReferrerStats(projectId: string, days: number = 30): Promise<QueryResult<ReferrerStats[]>> {
    try {
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const groups = await prisma.event.groupBy({
        by: ['referrer'],
        where: {
          projectId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          _all: true
        }
      });

      const referrerMap: { [key: string]: number } = {};
      let totalVisitors = 0;

      groups.forEach(g => {
        let referrer = g.referrer || 'Direct';
        if (referrer && referrer !== 'Direct') {
          try {
            const url = new URL(referrer);
            referrer = url.hostname;
          } catch {
            referrer = 'Direct';
          }
        }
        referrerMap[referrer] = (referrerMap[referrer] || 0) + g._count._all;
        totalVisitors += g._count._all;
      });

      const chartData: ReferrerStats[] = Object.entries(referrerMap)
        .map(([referrer, visitors]) => ({
          referrer,
          visitors,
          percentage: totalVisitors > 0 ? (visitors / totalVisitors) * 100 : 0
        }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 10);

      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      console.error('Error getting referrer stats:', error);
      return {
        success: false,
        error: 'Failed to get referrer stats'
      };
    }
  }

  /**
   * Get page stats (grouped by pageUrl)
   */
  static async getPageStats(
    projectId: string,
    days: number = 30
  ): Promise<QueryResult<PageStats[]>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const rows = await prisma.$queryRaw<
        { pageUrl: string; pageViews: bigint; visitors: bigint }[]
      >`
        SELECT
          "pageUrl",
          COUNT(*) AS "pageViews",
          COUNT(DISTINCT COALESCE("sessionId", id::text)) AS visitors
        FROM "Event"
        WHERE "projectId" = ${projectId}
          AND "timestamp" >= ${startDate}
        GROUP BY "pageUrl"
        ORDER BY visitors DESC
        LIMIT 20
      `;

      const data: PageStats[] = rows.map((r) => ({
        pageUrl: r.pageUrl,
        pageViews: Number(r.pageViews),
        visitors: Number(r.visitors),
      }));

      return { success: true, data };
    } catch (error) {
      console.error('Error getting page stats:', error);
      return { success: false, error: 'Failed to get page stats' };
    }
  }

  /**
   * Helper to query user agent counts in distinct groups
   */
  private static async getUserAgentCounts(projectId: string, startDate: Date) {
    return await prisma.$queryRaw<{ userAgent: string; count: bigint }[]>`
      SELECT
        "userAgent",
        COUNT(*) as count
      FROM "Event"
      WHERE "projectId" = ${projectId}
        AND "timestamp" >= ${startDate}
        AND "userAgent" IS NOT NULL
        AND "userAgent" != ''
      GROUP BY "userAgent"
    `;
  }

  /**
   * Get browser stats
   */
  static async getBrowserStats(
    projectId: string,
    days: number = 30
  ): Promise<QueryResult<BrowserStats[]>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const rows = await this.getUserAgentCounts(projectId, startDate);

      const getBrowser = (ua: string): string => {
        const u = ua.toLowerCase();
        if (u.includes('edg')) return 'Edge';
        if (u.includes('chrome') && !u.includes('chromium')) return 'Chrome';
        if (u.includes('safari') && !u.includes('chrome') && !u.includes('chromium')) return 'Safari';
        if (u.includes('firefox')) return 'Firefox';
        if (u.includes('opera') || u.includes('opr')) return 'Opera';
        return 'Other';
      };

      // Merge counts by browser name
      const browserCounts: Record<string, number> = {};
      let total = 0;

      for (const row of rows) {
        const browser = getBrowser(row.userAgent);
        const count = Number(row.count);
        browserCounts[browser] = (browserCounts[browser] || 0) + count;
        total += count;
      }

      const data: BrowserStats[] = Object.entries(browserCounts)
        .map(([browser, visitors]) => ({
          browser,
          visitors,
          share: total > 0 ? Math.round((visitors / total) * 100) : 0,
        }))
        .sort((a, b) => b.visitors - a.visitors);

      return { success: true, data };
    } catch (error) {
      console.error('Error getting browser stats:', error);
      return { success: false, error: 'Failed to get browser stats' };
    }
  }

  /**
   * Get device stats
   */
  static async getDeviceStats(
    projectId: string,
    days: number = 7
  ): Promise<QueryResult<DeviceStats[]>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const rows = await this.getUserAgentCounts(projectId, startDate);

      const counts = { Mobile: 0, Desktop: 0, Tablet: 0 };
      let total = 0;

      for (const { userAgent, count } of rows) {
        const n = Number(count);
        const device = /mobile|android|iphone|phone/i.test(userAgent)
          ? 'Mobile'
          : /tablet|ipad/i.test(userAgent)
          ? 'Tablet'
          : 'Desktop';
        counts[device] += n;
        total += n;
      }

      const data: DeviceStats[] = Object.entries(counts).map(([device, visitors]) => ({
        device,
        visitors,
        share: total > 0 ? Math.round((visitors / total) * 100) : 0,
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting device stats:', error);
      return { success: false, error: 'Failed to get device stats' };
    }
  }

  /**
   * Get event count
   */
  static async count(filters: EventFilters = {}): Promise<number> {
    try {
      const where: any = {};
      
      if (filters.id) where.id = filters.id;
      if (filters.projectId) where.projectId = filters.projectId;
      if (filters.sessionId) where.sessionId = filters.sessionId;
      if (filters.ip) where.ip = filters.ip;
      if (filters.country) where.country = filters.country;
      if (filters.city) where.city = filters.city;
      if (filters.pageUrl) where.pageUrl = { contains: filters.pageUrl, mode: 'insensitive' };
      if (filters.timestamp) where.timestamp = filters.timestamp;

      return await prisma.event.count({ where });
    } catch (error) {
      console.error('Error counting events:', error);
      return 0;
    }
  }

  /**
   * Get event count by project
   */
  static async countByProject(projectId: string): Promise<number> {
    try {
      return await prisma.event.count({
        where: { projectId }
      });
    } catch (error) {
      console.error('Error counting events by project:', error);
      return 0;
    }
  }
} 