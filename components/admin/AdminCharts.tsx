"use client";

import {
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

type WeekPoint = { week: string; enrollments: number; completions: number };
type VendorPoint = { vendor: string; courses: number };
type GroupPoint = { group: string; courses: number };

const BRAND = "#E30613";
const BRAND_LIGHT = "#F49AA0";
const PIE_COLORS = [
  "#E30613",
  "#B80510",
  "#8A040C",
  "#F49AA0",
  "#FBC4C8",
  "#E73B45",
  "#ED6F77",
  "#C70019",
];

export function EnrollmentTrendChart({ data }: { data: WeekPoint[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Enrollments & completions (last 8 weeks)</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-fg)",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="enrollments"
              stroke={BRAND}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Enrollments"
            />
            <Line
              type="monotone"
              dataKey="completions"
              stroke={BRAND_LIGHT}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Completions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CoursesByVendorChart({ data }: { data: VendorPoint[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Courses by partner</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <XAxis dataKey="vendor" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "rgba(227,6,19,0.08)" }}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-fg)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="courses" fill={BRAND} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CoursesByGroupChart({ data }: { data: GroupPoint[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Courses by domain</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-fg)",
                fontSize: 12,
              }}
            />
            <Pie
              data={data}
              dataKey="courses"
              nameKey="group"
              cx="50%"
              cy="50%"
              outerRadius={86}
              innerRadius={42}
              paddingAngle={2}
              stroke="var(--color-card)"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
