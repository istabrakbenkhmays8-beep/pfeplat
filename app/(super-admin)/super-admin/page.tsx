import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Coins,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import {
  coinFlowTrend,
  pendingActionQueue,
  recentAudit,
  revenueTrend,
  signupTrend,
  superAdminPulse,
  usersByRole,
} from "@/src/repositories/analyticsRepo";
import {
  CoinFlowChart,
  RevenueTrendChart,
  SignupTrendChart,
  UsersByRoleChart,
} from "@/components/super-admin/SuperAdminCharts";
import { AdvanciaCoin } from "@/components/ui/PaymentArt";

export const metadata = { title: "Super admin overview" };
export const dynamic = "force-dynamic";

export default async function SuperAdminOverviewPage() {
  const [pulse, signups, roles, revenue, coins, audit, queue] = await Promise.all([
    superAdminPulse(),
    signupTrend(),
    usersByRole(),
    revenueTrend(),
    coinFlowTrend(),
    recentAudit(6),
    pendingActionQueue(6),
  ]);

  const queueCount = pulse.pendingReservations + pulse.sessionsWithoutTrainer;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Super admin overview</h1>
          <p className="text-sm text-muted-foreground">
            Real-time pulse of the platform — users, sessions, money, coins, and audit.
          </p>
        </div>
        <Link
          href="/super-admin/agent"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-600"
        >
          <Sparkles className="h-4 w-4" />
          Ask the AI agent
        </Link>
      </header>

      {/* ───────── HERO KPIs ───────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Hero
          tone="brand"
          icon={<Users className="h-5 w-5" />}
          label="Platform users"
          value={pulse.totalUsers.toLocaleString()}
          sub={`${pulse.totalLearners} learners · ${pulse.totalAdmins} admins · ${pulse.totalSuperAdmins} super`}
        />
        <Hero
          tone="ink"
          icon={<CalendarClock className="h-5 w-5" />}
          label="Sessions (next 7 days)"
          value={pulse.sessionsNext7d.toLocaleString()}
          sub={`${pulse.totalSessions} scheduled in total`}
        />
        <Hero
          tone="brand"
          icon={<CreditCard className="h-5 w-5" />}
          label="Revenue this month"
          value={`${pulse.revenueMonthTnd.toLocaleString()} DT`}
          sub={`${pulse.paymentsMonth} successful payment${pulse.paymentsMonth === 1 ? "" : "s"}`}
        />
        <Hero
          tone="ink"
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Audit events (24h)"
          value={pulse.auditEvents24h.toLocaleString()}
          sub={`${pulse.auditEvents7d} in the last 7 days`}
        />
      </section>

      {/* ───────── ACTION QUEUE ───────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Needs your attention</h2>
          <span className="text-xs text-muted-foreground">
            {queueCount === 0 ? "All clear ✓" : `${queueCount} item${queueCount === 1 ? "" : "s"} pending`}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Action
            count={pulse.pendingReservations}
            label="Pending reservations"
            href="/super-admin/reservations"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <Action
            count={pulse.sessionsWithoutTrainer}
            label="Sessions missing a trainer"
            href="/super-admin/sessions"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <Action
            count={pulse.pendingVerification}
            label="Users awaiting verification"
            href="/admin/users"
            icon={<UserPlus className="h-4 w-4" />}
          />
          <Action
            count={pulse.failedPayments24h}
            label="Failed payments (24h)"
            href="/super-admin/audit"
            icon={<CreditCard className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* ───────── CHARTS ROW 1 ───────── */}
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <SignupTrendChart data={signups} />
        <UsersByRoleChart data={roles} />
      </section>

      {/* ───────── CHARTS ROW 2 ───────── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <RevenueTrendChart data={revenue} />
        <CoinFlowChart data={coins} />
      </section>

      {/* ───────── COIN ECONOMY STATS ───────── */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <AdvanciaCoin size={24} ariaLabel="" />
          <h2 className="text-base font-semibold">Coin economy</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="Coins in circulation"
            value={pulse.totalCoinsInCirculation.toLocaleString()}
            sub="Total balance across all wallets"
            tone="gold"
          />
          <Stat
            label="Earned this month"
            value={`+${pulse.totalCoinsEarnedMonth.toLocaleString()}`}
            sub="Course completions + bonuses"
            tone="success"
          />
          <Stat
            label="Spent this month"
            value={`−${pulse.totalCoinsSpentMonth.toLocaleString()}`}
            sub="Course discounts"
            tone="danger"
          />
        </div>
      </section>

      {/* ───────── CATALOG + LEARNING STATS ───────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Published courses" value={pulse.publishedCourses} sub={`${pulse.totalCourses} in total`} icon={<GraduationCap className="h-4 w-4" />} />
        <Stat label="Active learners" value={pulse.activeLearners} sub="Status: active" icon={<Users className="h-4 w-4" />} />
        <Stat label="Completion rate" value={`${pulse.completionRate}%`} sub={`${pulse.totalEnrollments} total enrolments`} icon={<CheckCircle2 className="h-4 w-4" />} />
        <Stat label="Certificates this month" value={pulse.certificatesMonth} sub="Issued PDFs" icon={<GraduationCap className="h-4 w-4" />} />
      </section>

      {/* ───────── AUDIT + QUEUE ───────── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent activity</h2>
            <Link href="/super-admin/audit" className="text-xs font-medium text-brand hover:underline">
              Open audit log →
            </Link>
          </div>
          {audit.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {audit.map((a) => (
                <li key={a._id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      <span className="text-brand">{a.action}</span>
                      {a.targetType && <span className="text-muted-foreground"> · {a.targetType}</span>}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.actor
                        ? `${a.actor.firstName ?? ""} ${a.actor.surname ?? ""}`.trim() || a.actor.email
                        : a.actorRole ?? "system"}
                    </p>
                  </div>
                  <time className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(a.at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Pending action queue</h2>
            <span className="text-xs text-muted-foreground">{queue.length} item{queue.length === 1 ? "" : "s"}</span>
          </div>
          {queue.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <CheckCircle2 className="me-2 h-4 w-4 text-success" />
              Nothing waiting — you&rsquo;re ahead of the queue.
            </div>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {queue.map((q) => (
                <li key={q.kind === "reservation" ? `r-${q.id}` : `s-${q.id}`} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    {q.kind === "reservation" ? (
                      <>
                        <p className="truncate font-medium">
                          <span className="me-2 inline-flex items-center rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                            Reservation
                          </span>
                          {q.course}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{q.user}</p>
                      </>
                    ) : (
                      <>
                        <p className="truncate font-medium">
                          <span className="me-2 inline-flex items-center rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
                            No trainer
                          </span>
                          {q.course}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Starts{" "}
                          {new Date(q.startsAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </>
                    )}
                  </div>
                  <Link
                    href={q.kind === "reservation" ? "/super-admin/reservations" : "/super-admin/sessions"}
                    className="inline-flex items-center text-xs font-medium text-brand hover:underline"
                  >
                    Resolve <ArrowRight className="ms-1 h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* AI agent CTA */}
      <Link
        href="/super-admin/agent"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-brand/40 bg-gradient-to-r from-brand/10 via-card to-card p-5 transition hover:border-brand"
      >
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <p className="font-semibold">Ada — the platform agent</p>
            <p className="text-sm text-muted-foreground">
              Ask in plain language. She can create courses, assign trainers, approve reservations and export data — with your confirmation.
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-brand" />
      </Link>
    </div>
  );
}

/* ---------------- Local primitives ---------------- */

function Hero({
  tone,
  icon,
  label,
  value,
  sub,
}: {
  tone: "brand" | "ink";
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  const surface =
    tone === "brand"
      ? "bg-gradient-to-br from-brand to-brand-700 text-brand-foreground"
      : "bg-gradient-to-br from-zinc-900 to-zinc-700 text-white";
  return (
    <div className={`rounded-2xl border border-border p-5 shadow-sm ${surface}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-90">{label}</p>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-80">{sub}</p>}
    </div>
  );
}

function Action({
  count,
  label,
  href,
  icon,
}: {
  count: number;
  label: string;
  href: string;
  icon: React.ReactNode;
}) {
  const ok = count === 0;
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
        ok ? "border-border bg-card" : "border-warning/40 bg-warning/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
            ok ? "bg-muted text-muted-foreground" : "bg-warning/20 text-warning"
          }`}
        >
          {icon}
        </span>
        {!ok && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-warning px-1.5 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand opacity-0 transition group-hover:opacity-100">
        Open <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

function Stat({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  tone?: "gold" | "success" | "danger";
}) {
  const toneCls =
    tone === "gold"
      ? "text-amber-500"
      : tone === "success"
        ? "text-success"
        : tone === "danger"
          ? "text-danger"
          : "text-fg";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${toneCls}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* Eliminate "imported but not used" warning when sparklines aren't wired yet */
void Coins;
