import { prisma } from '@/lib/prisma';

export type Rating = 'good' | 'needs-improvement' | 'poor';

// Official Google thresholds
const THRESHOLDS: Record<'lcp' | 'inp' | 'cls', [number, number]> = {
  lcp: [2500, 4000], // ms
  inp: [200, 500],   // ms
  cls: [0.1, 0.25],  // unitless
};

export function rate(metric: keyof typeof THRESHOLDS, value: number | null): Rating | null {
  if (value === null || value === undefined) return null;
  const [good, needsImprovement] = THRESHOLDS[metric];
  if (value <= good) return 'good';
  if (value <= needsImprovement) return 'needs-improvement';
  return 'poor';
}

export async function getP75Vitals(projectId: string, days = 28) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    // Postgres PERCENTILE_CONT computes exact P75 aggregation inside DB
    const result = await prisma.$queryRaw<
      { lcp_p75: number | null; inp_p75: number | null; cls_p75: number | null; count: bigint | number }[]
    >`
      SELECT
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY "lcp") AS lcp_p75,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY "inp") AS inp_p75,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY "cls") AS cls_p75,
        COUNT(*) AS count
      FROM "WebVital"
      WHERE "projectId" = ${projectId}
        AND "createdAt" >= ${since}
    `;

    const row = result[0] ?? { lcp_p75: null, inp_p75: null, cls_p75: null, count: 0 };
    const totalSamples = Number(row.count ?? 0);

    const lcp = row.lcp_p75 !== null ? Math.round(Number(row.lcp_p75)) : null;
    const inp = row.inp_p75 !== null ? Math.round(Number(row.inp_p75)) : null;
    const cls = row.cls_p75 !== null ? Math.round(Number(row.cls_p75) * 1000) / 1000 : null;

    return {
      lcp,
      inp,
      cls,
      totalSamples,
      ratings: {
        lcp: rate('lcp', lcp),
        inp: rate('inp', inp),
        cls: rate('cls', cls),
      },
    };
  } catch (error) {
    console.error('Failed to get P75 vitals:', error);
    return {
      lcp: null,
      inp: null,
      cls: null,
      totalSamples: 0,
      ratings: {
        lcp: null,
        inp: null,
        cls: null,
      },
    };
  }
}
