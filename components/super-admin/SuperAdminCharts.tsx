"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SignupPoint = { week: string; signups: number };
type RoleSlice = { role: string; users: number };
type RevenuePoint = { week: string; revenueTnd: number };
type CoinFlowPoint = { week: string; earned: number; spent: number };

const BRAND = "#E30613";
const BRAND_DARK = "#8A040C";
const BRAND_LIGHT = "#F49AA0";
const ACCENT = "#0E7C66";
const GOLD = "#C08A1A";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "#8A040C",
  admin: "#E30613",
  user: "#F49AA0",
};
const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super admins",
  admin: "Admins",
  user: "Learners",
};

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  color: "var(--color-fg)",
  fontSize: 12,
};

export function SignupTrendChart({ data }: { data: SignupPoint[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">New sign-ups (last 8 weeks)</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="suGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND} stopOpacity={0.5} />
                <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="signups"
              stroke={BRAND}
              strokeWidth={2.5}
              fill="url(#suGrad)"
              name="Sign-ups"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function UsersByRoleChart({ data }: { data: RoleSlice[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Users by role</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer>
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
            <Pie
              data={data.map((d) => ({ ...d, role: ROLE_LABELS[d.role] ?? d.role }))}
              dataKey="users"
              nameKey="role"
              cx="50%"
              cy="50%"
              outerRadius={86}
              innerRadius={48}
              paddingAngle={3}
              stroke="var(--color-card)"
            >
              {data.map((d) => (
                <Cell key={d.role} fill={ROLE_COLORS[d.role] ?? BRAND_LIGHT} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RevenueTrendChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Revenue (last 8 weeks, TND)</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "rgba(227,6,19,0.08)" }}
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`${v.toLocaleString()} DT`, "Revenue"]}
            />
            <Bar dataKey="revenueTnd" fill={BRAND} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CoinFlowChart({ data }: { data: CoinFlowPoint[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Coin economy (last 8 weeks)</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="earned"
              stroke={GOLD}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Earned"
            />
            <Line
              type="monotone"
              dataKey="spent"
              stroke={ACCENT}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Spent"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* tiny inline sparkline for KPI cards */
export function Spark({ data, color = BRAND }: { data: number[]; color?: string }) {
  const dataPts = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer>
        <AreaChart data={dataPts} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spk-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.8}
            fill={`url(#spk-${color.replace("#", "")})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
