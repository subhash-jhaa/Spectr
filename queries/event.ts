import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { classifySource } from '@/lib/source-classifier';
import { classifyChannel } from '@/lib/channel-classifier';
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
  VisitorStats,
  SourceStats
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
      const where: Prisma.EventWhereInput = {};
      
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
        data: eventData as Prisma.EventCreateInput
      });

      return {
        success: true,
        data: event
      };
    } catch (error: any) {
      // Resilient fallback if in-memory Prisma client has not refreshed new UTM schema fields
      if (error?.message?.includes('Unknown argument')) {
        try {
          const coreData: any = {
            projectId: eventData.projectId,
            sessionId: eventData.sessionId || '',
            pageUrl: eventData.pageUrl || '',
            referrer: eventData.referrer || '',
            source: eventData.source || 'Direct',
            userAgent: eventData.userAgent || '',
            ip: eventData.ip || 'Unknown',
            country: eventData.country || 'Unknown',
            city: eventData.city || 'Unknown',
          };
          const fallbackEvent = await prisma.event.create({
            data: coreData
          });
          return {
            success: true,
            data: fallbackEvent
          };
        } catch (fallbackErr) {
          console.error('Fallback create event failed:', fallbackErr);
        }
      }

      console.error('Error creating event:', error);
      const msg = error instanceof Error ? error.message : 'Failed to create event';
      return {
        success: false,
        error: msg
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
            source: (event as any).source || 'Direct',
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
   * Combined browser + device stats from a single query
   */
  static async getUserAgentStats(
    projectId: string,
    days: number = 30
  ): Promise<QueryResult<{ browsers: BrowserStats[]; devices: DeviceStats[] }>> {
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

      const browserCounts: Record<string, number> = {};
      const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
      let total = 0;

      for (const row of rows) {
        const count = Number(row.count);
        total += count;
        // Browser
        const browser = getBrowser(row.userAgent);
        browserCounts[browser] = (browserCounts[browser] || 0) + count;
        // Device
        const device = /mobile|android|iphone|phone/i.test(row.userAgent)
          ? 'Mobile'
          : /tablet|ipad/i.test(row.userAgent)
          ? 'Tablet'
          : 'Desktop';
        deviceCounts[device] += count;
      }

      const browsers: BrowserStats[] = Object.entries(browserCounts)
        .map(([browser, visitors]) => ({
          browser,
          visitors,
          share: total > 0 ? Math.round((visitors / total) * 100) : 0,
        }))
        .sort((a, b) => b.visitors - a.visitors);

      const devices: DeviceStats[] = Object.entries(deviceCounts).map(([device, visitors]) => ({
        device,
        visitors,
        share: total > 0 ? Math.round((visitors / total) * 100) : 0,
      }));

      return { success: true, data: { browsers, devices } };
    } catch (error) {
      console.error('Error getting user agent stats:', error);
      return { success: false, error: 'Failed to get user agent stats' };
    }
  }

  /**
   * Get browser stats (delegates to getUserAgentStats)
   */
  static async getBrowserStats(
    projectId: string,
    days: number = 30
  ): Promise<QueryResult<BrowserStats[]>> {
    const result = await this.getUserAgentStats(projectId, days);
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data.browsers };
  }

  /**
   * Get device stats (delegates to getUserAgentStats)
   */
  static async getDeviceStats(
    projectId: string,
    days: number = 7
  ): Promise<QueryResult<DeviceStats[]>> {
    const result = await this.getUserAgentStats(projectId, days);
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data.devices };
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

  /**
   * Get traffic source stats (grouped by source field)
   */
  static async getSourceStats(projectId: string, days: number = 30): Promise<QueryResult<SourceStats[]>> {
    try {
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Strategy 1: Try Prisma groupBy if schema client is up to date
      try {
        const groups = await (prisma.event as any).groupBy({
          by: ['source'],
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

        if (Array.isArray(groups) && groups.length > 0) {
          const totalVisitors = groups.reduce((sum: number, g: any) => sum + (g._count?._all || 0), 0);

          const chartData: SourceStats[] = groups.map((g: any) => ({
            source: g.source || 'Direct',
            visitors: g._count?._all || 0,
            percentage: totalVisitors > 0 ? ((g._count?._all || 0) / totalVisitors) * 100 : 0
          }))
          .sort((a: SourceStats, b: SourceStats) => b.visitors - a.visitors)
          .slice(0, 15);

          return {
            success: true,
            data: chartData
          };
        }
      } catch (groupErr) {
        console.warn('Prisma groupBy on source failed, trying raw query fallback:', groupErr);
      }

      // Strategy 2: Raw SQL query (in case Prisma Client types are not updated in-memory)
      try {
        const rawGroups = await prisma.$queryRaw<Array<{ source: string | null; count: bigint | number }>>`
          SELECT COALESCE("source", 'Direct') as source, COUNT(*)::int as count
          FROM "Event"
          WHERE "projectId" = ${projectId}
            AND "timestamp" >= ${startDate}
            AND "timestamp" <= ${endDate}
          GROUP BY "source"
          ORDER BY count DESC
          LIMIT 15
        `;

        if (Array.isArray(rawGroups) && rawGroups.length > 0) {
          const total = rawGroups.reduce((sum, g) => sum + Number(g.count || 0), 0);
          const chartData: SourceStats[] = rawGroups.map(g => ({
            source: g.source || 'Direct',
            visitors: Number(g.count || 0),
            percentage: total > 0 ? (Number(g.count || 0) / total) * 100 : 0
          }));

          return {
            success: true,
            data: chartData
          };
        }
      } catch (rawErr) {
        console.warn('Raw query for sources failed, trying event classification fallback:', rawErr);
      }

      // Strategy 3: Dynamic fallback using findMany and classifySource
      const events = await prisma.event.findMany({
        where: {
          projectId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          referrer: true,
          pageUrl: true
        }
      });

      const sourceMap: { [key: string]: number } = {};
      events.forEach(e => {
        const sourceLabel = classifySource(e.referrer, e.pageUrl);
        sourceMap[sourceLabel] = (sourceMap[sourceLabel] || 0) + 1;
      });

      const totalVisitors = events.length;
      const chartData: SourceStats[] = Object.entries(sourceMap)
        .map(([source, visitors]) => ({
          source,
          visitors,
          percentage: totalVisitors > 0 ? (visitors / totalVisitors) * 100 : 0
        }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 15);

      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      console.error('Error getting source stats:', error);
      return {
        success: true,
        data: []
      };
    }
  }

  /**
   * Get Referrer / Attribution breakdown across 8 dimensions:
   * refs | urls | types | source | medium | campaign | term | content
   */
  static async getReferrerBreakdown(
    projectId: string,
    dimension: string = 'refs',
    days: number = 7
  ): Promise<QueryResult<Array<{ name: string; views: number; sessions: number }>>> {
    try {
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      let events: any[] = [];
      try {
        events = await prisma.event.findMany({
          where: {
            projectId,
            timestamp: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            referrer: true,
            pageUrl: true,
            source: true,
            sessionId: true,
            utmMedium: true,
            utmCampaign: true,
            utmTerm: true,
            utmContent: true
          }
        });
      } catch (findErr) {
        console.error('findMany in getReferrerBreakdown failed:', findErr);
      }

      const map = new Map<string, { views: number; sessions: Set<string> }>();

      const getHost = (ref: string, pageUrl: string) => {
        if (!ref || ref.trim() === '') return 'Direct / Not set';
        try {
          const refHost = new URL(ref.startsWith('http') ? ref : `https://${ref}`).hostname.toLowerCase().replace(/^www\./, '');
          const pageHost = new URL(pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`).hostname.toLowerCase().replace(/^www\./, '');
          if (pageHost && (refHost === pageHost || refHost.endsWith(`.${pageHost}`))) {
            return 'Direct / Not set';
          }
          return refHost;
        } catch {
          return ref.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || 'Direct / Not set';
        }
      };

      for (const e of events) {
        let key = 'Direct / Not set';
        const normDim = dimension.toLowerCase();

        if (normDim === 'refs') {
          key = getHost(e.referrer, e.pageUrl);
        } else if (normDim === 'urls') {
          if (!e.referrer || e.referrer.trim() === '') {
            key = 'Direct / Not set';
          } else {
            key = e.referrer;
          }
        } else if (normDim === 'types') {
          key = classifyChannel(e.source || 'Direct', e.utmMedium);
        } else if (normDim === 'source') {
          key = e.source || classifySource(e.referrer, e.pageUrl);
          if (key === 'Direct') key = 'Direct / Not set';
        } else if (normDim === 'medium') {
          let med = e.utmMedium;
          if (!med && e.pageUrl) {
            try {
              const u = new URL(e.pageUrl.startsWith('http') ? e.pageUrl : `https://${e.pageUrl}`);
              med = u.searchParams.get('utm_medium') || null;
            } catch {}
          }
          key = med || 'Direct / Not set';
        } else if (normDim === 'campaign') {
          let camp = e.utmCampaign;
          if (!camp && e.pageUrl) {
            try {
              const u = new URL(e.pageUrl.startsWith('http') ? e.pageUrl : `https://${e.pageUrl}`);
              camp = u.searchParams.get('utm_campaign') || null;
            } catch {}
          }
          key = camp || 'Direct / Not set';
        } else if (normDim === 'term') {
          let term = e.utmTerm;
          if (!term && e.pageUrl) {
            try {
              const u = new URL(e.pageUrl.startsWith('http') ? e.pageUrl : `https://${e.pageUrl}`);
              term = u.searchParams.get('utm_term') || null;
            } catch {}
          }
          key = term || 'Direct / Not set';
        } else if (normDim === 'content') {
          let cont = e.utmContent;
          if (!cont && e.pageUrl) {
            try {
              const u = new URL(e.pageUrl.startsWith('http') ? e.pageUrl : `https://${e.pageUrl}`);
              cont = u.searchParams.get('utm_content') || null;
            } catch {}
          }
          key = cont || 'Direct / Not set';
        }

        if (!map.has(key)) {
          map.set(key, { views: 0, sessions: new Set<string>() });
        }
        const item = map.get(key)!;
        item.views += 1;
        if (e.sessionId) {
          item.sessions.add(e.sessionId);
        } else {
          item.sessions.add(`anon_${item.views}`);
        }
      }

      const result = Array.from(map.entries()).map(([name, val]) => ({
        name,
        views: val.views,
        sessions: val.sessions.size
      })).sort((a, b) => b.views - a.views);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error getting referrer breakdown:', error);
      return {
        success: true,
        data: []
      };
    }
  }
} 