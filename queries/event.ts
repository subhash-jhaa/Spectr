import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { classifySource } from '@/lib/source-classifier';
import { classifyChannel } from '@/lib/channel-classifier';
import { 
  DatabaseEvent, 
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
  SourceStats,
  AudienceMixStats,
  OverviewMetrics
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
      
      try {
        const events = await prisma.event.findMany({
          where: {
            projectId,
            timestamp: {
              gte: timeThreshold
            }
          },
          select: {
            id: true,
            projectId: true,
            pageUrl: true,
            referrer: true,
            source: true,
            country: true,
            city: true,
            userAgent: true,
            timestamp: true,
            sessionId: true,
            ip: true
          },
          orderBy: { timestamp: 'desc' },
          take: 100
        });

        return {
          success: true,
          data: events as DatabaseEvent[],
          count: events.length
        };
      } catch (prismaErr) {
        console.warn('[Schema Fallback Triggered] findRecentEvents with source column failed, falling back to core columns:', prismaErr);
        
        try {
          const coreEvents = await prisma.event.findMany({
            where: {
              projectId,
              timestamp: {
                gte: timeThreshold
              }
            },
            select: {
              id: true,
              projectId: true,
              pageUrl: true,
              referrer: true,
              country: true,
              city: true,
              userAgent: true,
              timestamp: true,
              sessionId: true,
              ip: true
            },
            orderBy: { timestamp: 'desc' },
            take: 100
          });

          return {
            success: true,
            data: coreEvents.map(e => ({ ...e, source: 'Direct' })) as DatabaseEvent[],
            count: coreEvents.length
          };
        } catch (corePrismaErr) {
          console.warn('[Schema Fallback Triggered] Core findMany failed, falling back to safe raw SQL:', corePrismaErr);
          const rawEvents = await prisma.$queryRaw<DatabaseEvent[]>`
            SELECT "id", "projectId", "sessionId", "pageUrl", "referrer",
                   'Direct' AS "source",
                   "userAgent", "ip", "country", "city", "timestamp"
            FROM "Event"
            WHERE "projectId" = ${projectId}
              AND "timestamp" >= ${timeThreshold}
            ORDER BY "timestamp" DESC
            LIMIT 100
          `;
          return {
            success: true,
            data: rawEvents,
            count: rawEvents.length
          };
        }
      }
    } catch (error) {
      console.error('Fatal error in findRecentEvents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query recent events'
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
    } catch (error: unknown) {
      console.error('Standard create event failed, trying resilient schema fallbacks:', error);

      // Resilient fallback: Raw SQL insert with all fields, or fallback to core fields
      try {
        const id = eventData.id || randomUUID();
        const projectId = eventData.projectId!;
        const sessionId = eventData.sessionId || '';
        const pageUrl = eventData.pageUrl || '';
        const referrer = eventData.referrer || '';
        const source = eventData.source || 'Direct';
        const utmMedium = eventData.utmMedium || null;
        const utmCampaign = eventData.utmCampaign || null;
        const utmTerm = eventData.utmTerm || null;
        const utmContent = eventData.utmContent || null;
        const userAgent = eventData.userAgent || '';
        const ip = eventData.ip || 'Unknown';
        const country = eventData.country || 'Unknown';
        const city = eventData.city || 'Unknown';
        const timestamp = new Date();

        // Try inserting with all fields via raw SQL
        try {
          await prisma.$executeRaw`
            INSERT INTO "Event" ("id", "projectId", "sessionId", "pageUrl", "referrer", "source", "utmMedium", "utmCampaign", "utmTerm", "utmContent", "userAgent", "ip", "country", "city", "timestamp")
            VALUES (${id}, ${projectId}, ${sessionId}, ${pageUrl}, ${referrer}, ${source}, ${utmMedium}, ${utmCampaign}, ${utmTerm}, ${utmContent}, ${userAgent}, ${ip}, ${country}, ${city}, ${timestamp})
          `;
          return {
            success: true,
            data: { id, projectId, sessionId, pageUrl, referrer, source, utmMedium, utmCampaign, utmTerm, utmContent, userAgent, ip, country, city, timestamp } as DatabaseEvent
          };
        } catch (rawFullErr) {
          console.error('[SCHEMA_DRIFT_ALERT] Database is missing source/UTM columns! Dropping to core columns. Please run prisma/baseline_and_sync.sql on production DB.', rawFullErr);
          // Try inserting only core columns (guaranteed to exist on all database versions)
          await prisma.$executeRaw`
            INSERT INTO "Event" ("id", "projectId", "sessionId", "pageUrl", "referrer", "userAgent", "ip", "country", "city", "timestamp")
            VALUES (${id}, ${projectId}, ${sessionId}, ${pageUrl}, ${referrer}, ${userAgent}, ${ip}, ${country}, ${city}, ${timestamp})
          `;
          return {
            success: true,
            data: { id, projectId, sessionId, pageUrl, referrer, source: 'Direct', userAgent, ip, country, city, timestamp } as DatabaseEvent
          };
        }
      } catch (finalErr) {
        console.error('[SCHEMA_DRIFT_ALERT] All create event fallbacks failed:', finalErr);
      }

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
      console.error('Error updating event, trying raw SQL fallback:', error);
      try {
        await prisma.$executeRaw`
          UPDATE "Event"
          SET "timestamp" = ${new Date()},
              "referrer" = ${eventData.referrer || ''},
              "source" = ${eventData.source || 'Direct'},
              "userAgent" = ${eventData.userAgent || ''},
              "ip" = ${eventData.ip || 'Unknown'}
          WHERE "id" = ${id}
        `;
        return {
          success: true,
          data: { id, ...eventData } as DatabaseEvent,
          updated: true
        };
      } catch (fallbackUpdateErr) {
        console.error('Fallback update failed:', fallbackUpdateErr);
      }

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
  static async getRealtimeStats(projectId: string, minutesAgo: number = 3): Promise<QueryResult<RealtimeStats>> {
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
            source: event.source || 'Direct',
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
        error: error instanceof Error ? error.message : 'Failed to query realtime stats'
      };
    }
  }

  /**
   * Get daily visitor stats
   */
  static async getDailyStats(projectId: string, days: number = 7): Promise<QueryResult<DailyStats[]>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stats = await prisma.$queryRaw<any[]>`
        WITH session_activity AS (
          SELECT 
            "sessionId",
            COUNT(*) as cnt
          FROM "Event"
          WHERE "projectId" = ${projectId} AND "timestamp" >= ${startDate} AND "sessionId" IS NOT NULL
          GROUP BY "sessionId"
        )
        SELECT 
          TO_CHAR(DATE_TRUNC('day', e."timestamp"), 'YYYY-MM-DD') AS "date",
          COUNT(DISTINCT COALESCE(e."sessionId", e."ip"))::integer AS "visitors",
          COUNT(*)::integer AS "pageViews",
          COALESCE(
            ROUND(
              (COUNT(DISTINCT CASE WHEN s.cnt = 1 THEN e."sessionId" END)::numeric / 
               NULLIF(COUNT(DISTINCT e."sessionId"), 0)::numeric) * 100
            )::integer, 
            0
          ) AS "bounceRate"
        FROM "Event" e
        LEFT JOIN session_activity s ON e."sessionId" = s."sessionId"
        WHERE e."projectId" = ${projectId} AND e."timestamp" >= ${startDate}
        GROUP BY DATE_TRUNC('day', e."timestamp")
        ORDER BY DATE_TRUNC('day', e."timestamp") ASC
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
          pageViews: 0,
          bounceRate: 0
        };
      }

      // Merge query results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stats.forEach((row: any) => {
        if (dailyStatsMap[row.date]) {
          dailyStatsMap[row.date].visitors = Number(row.visitors || 0);
          dailyStatsMap[row.date].pageViews = Number(row.pageViews || 0);
          dailyStatsMap[row.date].bounceRate = Number(row.bounceRate || 0);
        } else {
          dailyStatsMap[row.date] = {
            date: row.date,
            visitors: Number(row.visitors || 0),
            pageViews: Number(row.pageViews || 0),
            bounceRate: Number(row.bounceRate || 0)
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
   * Get country stats (standardized unique visitors)
   */
  static async getCountryStats(projectId: string, days: number = 30): Promise<QueryResult<CountryStats[]>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const rows = await prisma.$queryRaw<Array<{ country: string | null; visitors: number | bigint }>>`
        SELECT
          COALESCE(NULLIF("country", ''), 'Unknown') AS country,
          COUNT(DISTINCT COALESCE("sessionId", "ip"))::integer AS visitors
        FROM "Event"
        WHERE "projectId" = ${projectId}
          AND "timestamp" >= ${startDate}
        GROUP BY COALESCE(NULLIF("country", ''), 'Unknown')
        ORDER BY visitors DESC
        LIMIT 10
      `;

      const totalVisitors = rows.reduce((sum, r) => sum + Number(r.visitors || 0), 0);
      
      const chartData: CountryStats[] = rows.map(r => ({
        country: r.country || 'Unknown',
        visitors: Number(r.visitors || 0),
        percentage: totalVisitors > 0 ? (Number(r.visitors || 0) / totalVisitors) * 100 : 0
      }));

      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      console.error('Error getting country stats:', error);
      return {
        success: true,
        data: []
      };
    }
  }

  /**
   * Get referrer stats (standardized unique visitors)
   */
  static async getReferrerStats(projectId: string, days: number = 30): Promise<QueryResult<ReferrerStats[]>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const rows = await prisma.$queryRaw<Array<{ referrer: string | null; visitors: number | bigint }>>`
        SELECT
          COALESCE("referrer", '') AS referrer,
          COUNT(DISTINCT COALESCE("sessionId", "ip"))::integer AS visitors
        FROM "Event"
        WHERE "projectId" = ${projectId}
          AND "timestamp" >= ${startDate}
        GROUP BY "referrer"
        ORDER BY visitors DESC
        LIMIT 25
      `;

      const referrerMap: { [key: string]: number } = {};
      let totalVisitors = 0;

      rows.forEach(r => {
        let referrer = r.referrer || 'Direct';
        if (referrer && referrer !== 'Direct') {
          try {
            const url = new URL(referrer.startsWith('http') ? referrer : `https://${referrer}`);
            referrer = url.hostname.replace(/^www\./, '');
          } catch {
            referrer = 'Direct';
          }
        } else {
          referrer = 'Direct';
        }
        const count = Number(r.visitors || 0);
        referrerMap[referrer] = (referrerMap[referrer] || 0) + count;
        totalVisitors += count;
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
        success: true,
        data: []
      };
    }
  }

  /**
   * Get page stats (grouped by pageUrl with standardized unique visitors)
   */
  static async getPageStats(
    projectId: string,
    days: number = 30
  ): Promise<QueryResult<PageStats[]>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const rows = await prisma.$queryRaw<
        { pageUrl: string; pageViews: bigint | number; visitors: bigint | number }[]
      >`
        SELECT
          "pageUrl",
          COUNT(*)::integer AS "pageViews",
          COUNT(DISTINCT COALESCE("sessionId", "ip"))::integer AS visitors
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
      return { success: true, data: [] };
    }
  }

  /**
   * Helper to query user agent counts in distinct groups (standardized unique visitors)
   */
  private static async getUserAgentCounts(projectId: string, startDate: Date) {
    return await prisma.$queryRaw<{ userAgent: string; count: bigint | number }[]>`
      SELECT
        "userAgent",
        COUNT(DISTINCT COALESCE("sessionId", "ip"))::bigint as count
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
      return { success: true, data: { browsers: [], devices: [] } };
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
      return { success: true, data: [] };
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
      return { success: true, data: [] };
    }
    return { success: true, data: result.data.devices };
  }

  /**
   * Get event count
   */
  static async count(filters: EventFilters = {}): Promise<number> {
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
   * Get traffic source stats (standardized unique visitors)
   */
  static async getSourceStats(projectId: string, days: number = 30): Promise<QueryResult<SourceStats[]>> {
    try {
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Strategy 1: Raw SQL with unique visitor count
      try {
        const rawGroups = await prisma.$queryRaw<Array<{ source: string | null; count: bigint | number }>>`
          SELECT COALESCE("source", 'Direct') as source, COUNT(DISTINCT COALESCE("sessionId", "ip"))::int as count
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
        console.warn('[Schema Fallback Triggered] Raw query for sources failed, trying event classification fallback:', rawErr);
      }

      // Strategy 2: Dynamic fallback using findMany and classifySource
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
          pageUrl: true,
          sessionId: true,
          ip: true
        }
      });

      const sourceMap: { [key: string]: Set<string> } = {};
      events.forEach(e => {
        const sourceLabel = classifySource(e.referrer, e.pageUrl);
        if (!sourceMap[sourceLabel]) {
          sourceMap[sourceLabel] = new Set();
        }
        sourceMap[sourceLabel].add(e.sessionId || e.ip);
      });

      const totalVisitors = Object.values(sourceMap).reduce((sum, set) => sum + set.size, 0);
      const chartData: SourceStats[] = Object.entries(sourceMap)
        .map(([source, visitorsSet]) => ({
          source,
          visitors: visitorsSet.size,
          percentage: totalVisitors > 0 ? (visitorsSet.size / totalVisitors) * 100 : 0
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
   * Get Audience Mix (New vs Returning visitors from historical session data)
   */
  static async getAudienceMix(projectId: string, days: number = 30): Promise<QueryResult<AudienceMixStats>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const rows = await prisma.$queryRaw<Array<{
        total_visitors: bigint | number;
        returning_visitors: bigint | number;
        new_visitors: bigint | number;
      }>>`
        WITH visitor_summary AS (
          SELECT
            COALESCE("sessionId", "ip") AS visitor_key,
            COUNT(*) AS total_hits,
            COUNT(DISTINCT DATE_TRUNC('day', "timestamp")) AS distinct_days
          FROM "Event"
          WHERE "projectId" = ${projectId}
            AND "timestamp" >= ${startDate}
          GROUP BY COALESCE("sessionId", "ip")
        )
        SELECT
          COUNT(*)::integer AS total_visitors,
          COUNT(CASE WHEN total_hits > 1 OR distinct_days > 1 THEN 1 END)::integer AS returning_visitors,
          COUNT(CASE WHEN total_hits = 1 AND distinct_days = 1 THEN 1 END)::integer AS new_visitors
        FROM visitor_summary
      `;

      if (rows && rows.length > 0) {
        const total = Number(rows[0].total_visitors || 0);
        const returning = Number(rows[0].returning_visitors || 0);
        const newVis = Number(rows[0].new_visitors || 0);
        const newShare = total > 0 ? Math.round((newVis / total) * 100) : 0;
        const returningShare = total > 0 ? 100 - newShare : 0;

        return {
          success: true,
          data: {
            newVisitors: newVis,
            returningVisitors: returning,
            newShare,
            returningShare
          }
        };
      }

      return {
        success: true,
        data: {
          newVisitors: 0,
          returningVisitors: 0,
          newShare: 0,
          returningShare: 0
        }
      };
    } catch (error) {
      console.error('Error getting audience mix:', error);
      return {
        success: true,
        data: {
          newVisitors: 0,
          returningVisitors: 0,
          newShare: 0,
          returningShare: 0
        }
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        console.warn('[Schema Fallback Triggered] Extended query in getReferrerBreakdown failed, using core columns fallback:', findErr);
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
              sessionId: true
            }
          });
        } catch (coreErr) {
          console.warn('[Schema Fallback Triggered] Core findMany failed, falling back to raw query:', coreErr);
          events = await prisma.$queryRaw<Array<{ referrer: string; pageUrl: string; sessionId: string }>>`
            SELECT "referrer", "pageUrl", "sessionId"
            FROM "Event"
            WHERE "projectId" = ${projectId}
              AND "timestamp" >= ${startDate}
              AND "timestamp" <= ${endDate}
          `;
        }
      }

      const map = new Map<string, { views: number; sessions: Set<string> }>();

      const getHost = (ref: string, pageUrl: string) => {
        if (!ref || ref.trim() === '') return 'Direct / None';
        try {
          const refHost = new URL(ref.startsWith('http') ? ref : `https://${ref}`).hostname.toLowerCase().replace(/^www\./, '');
          const pageHost = new URL(pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`).hostname.toLowerCase().replace(/^www\./, '');
          if (pageHost && (refHost === pageHost || refHost.endsWith(`.${pageHost}`))) {
            return 'Direct / None';
          }
          return refHost;
        } catch {
          return ref.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || 'Direct / None';
        }
      };

      for (const e of events) {
        let key = 'Direct / None';
        const normDim = dimension.toLowerCase();

        if (normDim === 'refs') {
          key = getHost(e.referrer, e.pageUrl);
        } else if (normDim === 'urls') {
          if (!e.referrer || e.referrer.trim() === '') {
            key = 'Direct / None';
          } else {
            key = e.referrer;
          }
        } else if (normDim === 'types') {
          key = classifyChannel(e.source || 'Direct', e.utmMedium);
        } else if (normDim === 'source') {
          key = e.source || classifySource(e.referrer, e.pageUrl);
          if (key === 'Direct') key = 'Direct / None';
        } else if (normDim === 'medium') {
          let med = e.utmMedium;
          if (!med && e.pageUrl) {
            try {
              const u = new URL(e.pageUrl.startsWith('http') ? e.pageUrl : `https://${e.pageUrl}`);
              med = u.searchParams.get('utm_medium') || null;
            } catch {}
          }
          key = med || 'Direct / None';
        } else if (normDim === 'campaign') {
          let camp = e.utmCampaign;
          if (!camp && e.pageUrl) {
            try {
              const u = new URL(e.pageUrl.startsWith('http') ? e.pageUrl : `https://${e.pageUrl}`);
              camp = u.searchParams.get('utm_campaign') || null;
            } catch {}
          }
          key = camp || 'Direct / None';
        } else if (normDim === 'term') {
          let term = e.utmTerm;
          if (!term && e.pageUrl) {
            try {
              const u = new URL(e.pageUrl.startsWith('http') ? e.pageUrl : `https://${e.pageUrl}`);
              term = u.searchParams.get('utm_term') || null;
            } catch {}
          }
          key = term || 'Direct / None';
        } else if (normDim === 'content') {
          let cont = e.utmContent;
          if (!cont && e.pageUrl) {
            try {
              const u = new URL(e.pageUrl.startsWith('http') ? e.pageUrl : `https://${e.pageUrl}`);
              cont = u.searchParams.get('utm_content') || null;
            } catch {}
          }
          key = cont || 'Direct / None';
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

  /**
   * Get overview metrics (Unique Visitors, Page Views, Bounce Rate) with prior period deltas
   */
  static async getOverviewMetrics(projectId: string, days: number = 7): Promise<QueryResult<OverviewMetrics>> {
    try {
      const now = new Date();
      const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const priorStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

      const rows = await prisma.$queryRaw<any[]>`
        WITH current_period AS (
          SELECT COALESCE("sessionId", "ip") AS vid, "sessionId"
          FROM "Event"
          WHERE "projectId" = ${projectId} AND "timestamp" >= ${currentStart} AND "timestamp" <= ${now}
        ),
        prior_period AS (
          SELECT COALESCE("sessionId", "ip") AS vid, "sessionId"
          FROM "Event"
          WHERE "projectId" = ${projectId} AND "timestamp" >= ${priorStart} AND "timestamp" < ${currentStart}
        ),
        curr_sessions AS (
          SELECT "sessionId", COUNT(*) AS cnt
          FROM current_period
          WHERE "sessionId" IS NOT NULL
          GROUP BY "sessionId"
        ),
        prior_sessions AS (
          SELECT "sessionId", COUNT(*) AS cnt
          FROM prior_period
          WHERE "sessionId" IS NOT NULL
          GROUP BY "sessionId"
        )
        SELECT
          (SELECT COUNT(DISTINCT vid) FROM current_period)::int AS "currVisitors",
          (SELECT COUNT(DISTINCT vid) FROM prior_period)::int AS "priorVisitors",
          (SELECT COUNT(*) FROM current_period)::int AS "currPageviews",
          (SELECT COUNT(*) FROM prior_period)::int AS "priorPageviews",
          (SELECT COUNT(*) FROM curr_sessions)::int AS "currTotalSessions",
          (SELECT COUNT(*) FROM curr_sessions WHERE cnt = 1)::int AS "currBouncedSessions",
          (SELECT COUNT(*) FROM prior_sessions)::int AS "priorTotalSessions",
          (SELECT COUNT(*) FROM prior_sessions WHERE cnt = 1)::int AS "priorBouncedSessions";
      `;

      const row = rows[0] || {};
      const currVisitors = Number(row.currVisitors || 0);
      const priorVisitors = Number(row.priorVisitors || 0);
      const currPageviews = Number(row.currPageviews || 0);
      const priorPageviews = Number(row.priorPageviews || 0);
      const currTotalSessions = Number(row.currTotalSessions || 0);
      const currBouncedSessions = Number(row.currBouncedSessions || 0);
      const priorTotalSessions = Number(row.priorTotalSessions || 0);
      const priorBouncedSessions = Number(row.priorBouncedSessions || 0);

      const currBounceRate = currTotalSessions > 0 ? Math.round((currBouncedSessions / currTotalSessions) * 100) : 0;
      const priorBounceRate = priorTotalSessions > 0 ? Math.round((priorBouncedSessions / priorTotalSessions) * 100) : 0;

      const calcDelta = (curr: number, prior: number) => {
        if (prior === 0 && curr > 0) {
          return { delta: 100, isNew: true };
        }
        if (prior === 0 && curr === 0) {
          return { delta: 0, isNew: false };
        }
        return {
          delta: Math.round(((curr - prior) / prior) * 100),
          isNew: false
        };
      };

      const visitorsDelta = calcDelta(currVisitors, priorVisitors);
      const pageviewsDelta = calcDelta(currPageviews, priorPageviews);
      
      const bounceDelta = priorTotalSessions === 0 && currTotalSessions > 0 
        ? { delta: currBounceRate, isNew: true }
        : { delta: currBounceRate - priorBounceRate, isNew: false };

      return {
        success: true,
        data: {
          visitors: {
            current: currVisitors,
            prior: priorVisitors,
            delta: visitorsDelta.delta,
            isNew: visitorsDelta.isNew
          },
          pageViews: {
            current: currPageviews,
            prior: priorPageviews,
            delta: pageviewsDelta.delta,
            isNew: pageviewsDelta.isNew
          },
          bounceRate: {
            current: currBounceRate,
            prior: priorBounceRate,
            delta: bounceDelta.delta,
            isNew: bounceDelta.isNew
          }
        }
      };
    } catch (error) {
      console.error('Error getting overview metrics:', error);
      return {
        success: false,
        error: 'Failed to get overview metrics'
      };
    }
  }
} 