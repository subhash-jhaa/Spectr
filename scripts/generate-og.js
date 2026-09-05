const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Spectr Matter geometric icon mark
const MATTER_PATH = "M76.0197455,64.2869435 C86.7885123,73.0232585 99.5898013,78.8974948 113.235451,81.364431 L113.235451,8.55613423 L128.063765,1.42108547e-14 L142.880485,8.55613423 L142.880485,81.364431 C156.528852,78.8950158 169.333304,73.0211579 180.107785,64.2869435 L207.028305,79.8572528 C163.246001,123.173374 92.7539991,123.173374 48.9716951,79.8572528 L76.0197455,64.2869435 Z M108.737104,250.214755 C124.350488,190.622833 89.0718235,129.570369 29.6450342,113.339794 L29.6450342,144.492007 C42.598944,149.448802 54.0917434,157.595849 63.0580137,168.17789 L0,204.582039 L0,221.705901 L14.8283139,230.215661 L77.8747339,193.811512 C82.5608843,206.864804 83.8729292,220.890524 81.6890539,234.586477 L108.737104,250.214755 Z M226.412934,113.339794 C167.018422,129.606299 131.778883,190.644738 147.390426,250.214755 L174.368914,234.632852 C172.190086,220.936735 173.502013,206.912275 178.183234,193.857887 L241.18328,230.215661 L256,221.659526 L256,204.582039 L192.941986,168.17789 C201.910643,157.598451 213.402721,149.451915 226.354966,144.492007 L226.412934,113.339794 Z";

// Topographic contour lines generator
function generateTopographicContours() {
  const paths = [];

  // Bottom-left to mid-right wave field
  for (let i = 0; i <= 24; i++) {
    const offset = i * 36;
    const yStart = 680 - offset * 0.7;
    const cp1x = 180 + Math.sin(i * 0.45) * 40;
    const cp1y = 580 - offset * 0.78 + Math.cos(i * 0.35) * 35;
    const cp2x = 520 + Math.cos(i * 0.4) * 45;
    const cp2y = 440 - offset * 0.85 + Math.sin(i * 0.5) * 40;
    const cp3x = 860 + Math.sin(i * 0.35) * 40;
    const cp3y = 280 - offset * 0.9 + Math.cos(i * 0.4) * 35;
    const yEnd = 160 - offset * 0.95;

    const d = `M -60 ${yStart} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${cp3x} ${cp3y}, 1260 ${yEnd}`;
    const opacity = 0.08 + (i % 4 === 0 ? 0.08 : 0.03);
    paths.push(`<path d="${d}" fill="none" stroke="#3ba6f1" stroke-width="1.15" stroke-opacity="${opacity}" />`);
  }

  // Top-right contour swirls
  for (let j = 0; j <= 12; j++) {
    const rX = 260 + j * 45;
    const rY = 160 + j * 35;
    const d = `M ${1200 - rX} -40 C ${1200 - rX + 40} ${rY * 0.8}, ${1200 - 30} ${rY}, 1240 ${rY * 0.7}`;
    paths.push(`<path d="${d}" fill="none" stroke="#3ba6f1" stroke-width="1.15" stroke-opacity="${0.07 + (j % 3 === 0 ? 0.05 : 0.02)}" />`);
  }

  return paths.join('\n  ');
}

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Card Drop Shadow Filter -->
    <filter id="tableShadow" x="-5%" y="-15%" width="110%" height="135%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="-10" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.08" />
      <feDropShadow dx="0" dy="-2" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.04" />
    </filter>

    <filter id="badgeShadow" x="-10%" y="-20%" width="120%" height="150%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.03" />
    </filter>
  </defs>

  <!-- Clean Off-White Canvas with Rounded Outer Frame -->
  <rect x="12" y="12" width="1176" height="606" rx="36" fill="#fcfcfd" stroke="#e2e8f0" stroke-width="1.5" />

  <!-- Organic Topographic Contour Wave Lines -->
  <g>
    ${generateTopographicContours()}
  </g>

  <!-- TOP-LEFT: Brand Logo & Name -->
  <g transform="translate(76, 76)">
    <!-- Spectr Logo Mark in Dark Slate -->
    <g transform="translate(0, 0) scale(0.15)">
      <path d="${MATTER_PATH}" fill="#0f172a" />
    </g>
    <!-- Spectr Wordmark -->
    <text x="50" y="29" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="34" font-weight="800" fill="#0f172a" letter-spacing="-1">
      Spectr
    </text>
  </g>

  <!-- MAIN HEADING -->
  <g transform="translate(76, 206)">
    <text font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="64" font-weight="800" fill="#0f172a" letter-spacing="-2.2">
      <tspan x="0" y="0">Know your traffic —</tspan>
      <tspan x="0" y="74" fill="#3ba6f1">simple &amp; actionable</tspan>
    </text>
  </g>

  <!-- SUBHEADING / TAGLINE -->
  <g transform="translate(76, 344)">
    <text font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="21.5" font-weight="500" fill="#64748b" letter-spacing="-0.3">
      Real-time, privacy-first analytics for developers. Zero cookies, zero bloat.
    </text>
  </g>

  <!-- BOTTOM PREVIEW: Analytics Dashboard Table Peeking from Bottom Edge -->
  <g transform="translate(68, 418)">
    <!-- Elevated Floating Card -->
    <rect x="0" y="0" width="1064" height="230" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" filter="url(#tableShadow)" />

    <!-- Top Bar with Tabs and Live Stats -->
    <g transform="translate(36, 28)">
      <!-- Tab 1: Overview (Active) -->
      <rect x="0" y="-8" width="96" height="32" rx="8" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1" />
      <text x="48" y="13" text-anchor="middle" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="13" font-weight="700" fill="#0284c7">
        Overview
      </text>

      <!-- Tab 2: Live Feed with Pulsing Green Dot -->
      <g transform="translate(108, 0)">
        <rect x="0" y="-8" width="138" height="32" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
        <circle cx="18" cy="8" r="4" fill="#16a34a" />
        <circle cx="18" cy="8" r="8" fill="#16a34a" fill-opacity="0.2" />
        <text x="32" y="13" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="13" font-weight="600" fill="#475569">
          Live Feed (128)
        </text>
      </g>

      <!-- Right Stat: 7-Day Traffic -->
      <g transform="translate(760, 2)">
        <text x="0" y="10" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="12" font-weight="700" fill="#94a3b8" letter-spacing="1">
          7-DAY VISITORS
        </text>
        <text x="115" y="12" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="18" font-weight="800" fill="#0f172a">
          4,284
        </text>
        <text x="172" y="12" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="13" font-weight="700" fill="#16a34a">
          ↑ 18.4%
        </text>
      </g>
    </g>

    <!-- Table Header Row -->
    <g transform="translate(36, 86)">
      <line x1="0" y1="20" x2="992" y2="20" stroke="#f1f5f9" stroke-width="1.5" />
      
      <text x="0" y="10" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="11.5" font-weight="700" fill="#94a3b8" letter-spacing="1">
        PAGE PATH
      </text>
      <text x="390" y="10" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="11.5" font-weight="700" fill="#94a3b8" letter-spacing="1">
        VISITORS
      </text>
      <text x="680" y="10" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="11.5" font-weight="700" fill="#94a3b8" letter-spacing="1">
        BOUNCE RATE
      </text>
      <text x="890" y="10" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="11.5" font-weight="700" fill="#94a3b8" letter-spacing="1">
        TELEMETRY
      </text>
    </g>

    <!-- Table Row 1 -->
    <g transform="translate(36, 134)">
      <text x="0" y="12" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="14.5" font-weight="700" fill="#0f172a">
        / (Landing page)
      </text>
      <g transform="translate(390, 2)">
        <text x="0" y="10" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="14" font-weight="600" fill="#0f172a">
          2,451
        </text>
        <rect x="58" y="2" width="170" height="8" rx="4" fill="#f1f5f9" />
        <rect x="58" y="2" width="124" height="8" rx="4" fill="#3ba6f1" />
      </g>
      <text x="680" y="12" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="14" font-weight="600" fill="#475569">
        24.2%
      </text>
      <g transform="translate(890, -4)">
        <rect x="0" y="0" width="84" height="23" rx="6" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1" />
        <text x="42" y="15.5" text-anchor="middle" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="11.5" font-weight="700" fill="#16a34a">
          ● Live
        </text>
      </g>
    </g>

    <!-- Table Row 2 -->
    <g transform="translate(36, 178)">
      <text x="0" y="12" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="14.5" font-weight="700" fill="#0f172a">
        /dashboard
      </text>
      <g transform="translate(390, 2)">
        <text x="0" y="10" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="14" font-weight="600" fill="#0f172a">
          1,245
        </text>
        <rect x="58" y="2" width="170" height="8" rx="4" fill="#f1f5f9" />
        <rect x="58" y="2" width="72" height="8" rx="4" fill="#3ba6f1" />
      </g>
      <text x="680" y="12" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="14" font-weight="600" fill="#475569">
        18.5%
      </text>
      <g transform="translate(890, -4)">
        <rect x="0" y="0" width="96" height="23" rx="6" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1" />
        <text x="48" y="15.5" text-anchor="middle" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="11.5" font-weight="700" fill="#2563eb">
          Cookieless
        </text>
      </g>
    </g>
  </g>
</svg>
`;

async function run() {
  const rootDir = path.join(__dirname, '..');
  const destinations = [
    path.join(rootDir, 'public', 'preview.png'),
    path.join(rootDir, 'public', 'og.png'),
    path.join(rootDir, 'app', 'opengraph-image.png'),
    path.join(rootDir, 'app', 'twitter-image.png')
  ];

  const pngBuffer = await sharp(Buffer.from(svg))
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  destinations.forEach(dest => {
    fs.writeFileSync(dest, pngBuffer);
    console.log('Successfully written:', dest);
  });
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
