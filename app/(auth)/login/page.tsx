import LoginForm from "@/components/auth/LoginForm";

const jobStages = [
  { label: "Applied", value: 18, max: 18 },
  { label: "Interview", value: 9, max: 18 },
  { label: "Offer", value: 3, max: 18 },
  { label: "Rejected", value: 6, max: 18 },
];

const earningsPoints = [3200, 4100, 3800, 5200, 4700, 6100, 5800, 7200, 6800, 8200];

const contracts = [
  { label: "Active", value: 6, color: "#258CF2" },
  { label: "Pending", value: 3, color: "#EFBF26" },
  { label: "Expired", value: 2, color: "#D9DBDD" },
];

function SparkLine({ points }: { points: number[] }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const w = 180;
  const h = 48;
  const pad = 4;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p - min) / (max - min)) * (h - pad * 2);
    return `${x},${y}`;
  });

  const areaBottom = `${w - pad},${h} ${pad},${h}`;
  const polyPoints = coords.join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#258CF2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#258CF2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${polyPoints} ${areaBottom}`} fill="url(#sparkGrad)" />
      <polyline points={polyPoints} stroke="#258CF2" strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function BarChart({ stages }: { stages: typeof jobStages }) {
  return (
    <div className="flex flex-col gap-[6px] w-full">
      {stages.map((s) => {
        const pct = Math.round((s.value / s.max) * 100);
        return (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-smoky6 text-[11px] w-[54px] shrink-0">{s.label}</span>
            <div className="flex-1 h-[6px] rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-smoky5 text-[11px] w-[18px] text-right">{s.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function ContractDonut({ items }: { items: typeof contracts }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  const r = 22;
  const cx = 28;
  const cy = 28;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const slices = items.map((item) => {
    const dash = (item.value / total) * circumference;
    const gap = circumference - dash;
    const rotation = (offset / total) * 360 - 90;
    offset += item.value;
    return { ...item, dash, gap, rotation };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={56} height={56} viewBox="0 0 56 56">
        {slices.map((s) => (
          <circle
            key={s.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={7}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={0}
            transform={`rotate(${s.rotation} ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        ))}
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="bold">
          {total}
        </text>
      </svg>
      <div className="flex flex-col gap-[5px]">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-smoky6 text-[11px]">{item.label}</span>
            <span className="text-smoky5 text-[11px] font-semibold ml-1">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans">
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-col w-1/2 bg-smoky13 p-[60px] relative overflow-hidden">
        {/* Dot grid texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Glow accents */}
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-blue700 opacity-[0.08] blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-[360px] h-[360px] rounded-full bg-blue500 opacity-[0.07] blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-1">
          <span className="text-white font-bold text-[24px] tracking-tight">OppTracker</span>
          <span className="text-blue500 text-[30px] leading-none font-bold">.</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 mt-10">
          <p className="text-smoky6 text-[12px] font-semibold uppercase tracking-[0.15em] mb-3">
            All your work. One place.
          </p>
          <h1 className="text-white font-bold text-[32px] leading-snug max-w-[400px]">
            Your work. Your contracts.<br />Your pipeline.
          </h1>
          <p className="text-smoky7 text-[14px] mt-3 max-w-[360px] leading-relaxed">
            Track freelance gigs, job applications, and contracts — built for how you actually work.
          </p>
        </div>

        {/* Charts */}
        <div className="relative z-10 mt-10 flex flex-col gap-4">

          {/* Earnings sparkline */}
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-[16px] px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-smoky6 text-[11px] uppercase tracking-wider">Freelance Earnings</p>
                <p className="text-white font-bold text-[20px] mt-0.5">$8,200 <span className="text-success text-[12px] font-medium">+18%</span></p>
              </div>
              <span className="text-smoky7 text-[11px]">Last 10 months</span>
            </div>
            <SparkLine points={earningsPoints} />
          </div>

          <div className="flex gap-4">
            {/* Job pipeline bar chart */}
            <div className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-[16px] px-5 py-4">
              <p className="text-smoky6 text-[11px] uppercase tracking-wider mb-1">Job Pipeline</p>
              <p className="text-white font-bold text-[20px] mb-4">14 open</p>
              <BarChart stages={jobStages} />
            </div>

            {/* Contracts donut */}
            <div className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-[16px] px-5 py-4">
              <p className="text-smoky6 text-[11px] uppercase tracking-wider mb-1">Contracts</p>
              <p className="text-white font-bold text-[20px] mb-4">11 total</p>
              <ContractDonut items={contracts} />
            </div>
          </div>
        </div>

        {/* Footer stats */}
        <div className="relative z-10 mt-auto flex gap-8 border-t border-white/[0.07] pt-5">
          {[
            { label: "Avg. Contract Value", value: "$3.4K" },
            { label: "Interviews This Month", value: "5" },
            { label: "Win Rate", value: "33%" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-white font-bold text-[18px]">{s.value}</p>
              <p className="text-smoky7 text-[11px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex flex-1 items-center justify-center bg-white px-8">
        <LoginForm />
      </div>
    </div>
  );
}
