import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Printer,
  Users,
  ClipboardCheck,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { students, teacher } from "@/lib/savod/data";
import { useSavod } from "@/lib/savod/store";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const results = useSavod((s) => s.results);

  const priority = students
    .filter(
      (s) =>
        s.profile === "Tushunish yordami kerak" ||
        s.profile === "Ravonlik yordami kerak" ||
        s.profile === "Dekodlash yordami kerak",
    )
    .slice(0, 3);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Assalomu alaykum, Dilnoza opa
          </h1>
          <p className="text-muted-foreground mt-1">
            Bugungi o‘qish holati va e’tibor talab qiladigan o‘quvchilar.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"
          >
            <Printer className="h-4 w-4" /> Hisobotni yuklash
          </button>
          <Link
            to="/assessment/setup"
            className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-4 py-2 text-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Yangi baholash
          </Link>
        </div>
      </div>

      {/* Overview */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard label="O‘quvchilar" value="24" sub={teacher.classroom} icon={Users} />
        <OverviewCard label="Shu hafta baholandi" value="18" sub="o‘tgan haftaga nisbatan +4" icon={ClipboardCheck} />
        <OverviewCard label="E’tibor talab qiladi" value="7" sub="3 ta yangi natija" icon={AlertTriangle} tone="warn" />
        <OverviewCard label="O‘rtacha tushunish" value="68%" sub="sinf o‘rtachasi" icon={BookOpen} />
      </div>

      {/* Distribution */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">O‘qish profili taqsimoti</h2>
        <p className="text-sm text-muted-foreground">
          Sinfingizdagi o‘quvchilar qaysi yordam guruhiga kiradi.
        </p>
        <div className="mt-4 rounded-2xl border bg-card p-5">
          <div className="flex w-full h-3 rounded-full overflow-hidden">
            <Seg pct={(8 / 24) * 100} color="var(--success)" />
            <Seg pct={(5 / 24) * 100} color="var(--info)" />
            <Seg pct={(7 / 24) * 100} color="var(--warn)" />
            <Seg pct={(4 / 24) * 100} color="var(--danger)" />
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <LegendItem color="var(--success)" label="Mustaqil o‘quvchilar" value="8" />
            <LegendItem color="var(--info)" label="Ravonlik yordami kerak" value="5" />
            <LegendItem color="var(--warn)" label="Tushunish yordami kerak" value="7" />
            <LegendItem color="var(--danger)" label="Dekodlash yordami kerak" value="4" />
          </div>
        </div>
      </section>

      {/* Priority */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">E’tibor talab qiladigan o‘quvchilar</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <Th>O‘quvchi</Th>
                <Th>Oxirgi baholash</Th>
                <Th>Dekodlash</Th>
                <Th>Ravonlik</Th>
                <Th>Tushunish</Th>
                <Th>Aniqlangan ehtiyoj</Th>
                <Th>Amal</Th>
              </tr>
            </thead>
            <tbody>
              {priority.map((s) => (
                <tr key={s.id} className="border-t">
                  <Td className="font-medium">{s.name}</Td>
                  <Td>{s.lastAssessmentDate}</Td>
                  <Td><ScoreChip v={s.scores?.decoding ?? 0} /></Td>
                  <Td><ScoreChip v={s.scores?.fluency ?? 0} /></Td>
                  <Td><ScoreChip v={s.scores?.comprehension ?? 0} /></Td>
                  <Td>
                    <span className="text-xs text-muted-foreground">
                      {s.profile === "Tushunish yordami kerak"
                        ? "Sabab-natija"
                        : s.profile === "Ravonlik yordami kerak"
                          ? "Gaplarni mazmunli bo‘lib o‘qish"
                          : "So‘zlarni tanish"}
                    </span>
                  </Td>
                  <Td>
                    <Link
                      to="/students/$id"
                      params={{ id: s.id }}
                      className="inline-flex items-center rounded-full border px-3 py-1 text-xs hover:bg-muted"
                    >
                      Ko‘rish
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent activity */}
      <section className="mt-10 grid lg:grid-cols-3 gap-4">
        {results.length > 0 && (
          <ActivityCard
            title={`${results[0].studentName} baholashni yakunladi`}
            time="hozirgina"
            color="success"
          />
        )}
        <ActivityCard
          title="Madina uchun ravonlik mashqi tavsiya qilindi"
          time="2 soat oldin"
          color="info"
        />
        <ActivityCard
          title="3-“A” sinfining haftalik hisoboti tayyor"
          time="kecha"
          color="warn"
        />
      </section>
    </div>
  );
}

function OverviewCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "info",
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Users;
  tone?: "info" | "warn" | "success";
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <Icon
          className="h-4 w-4"
          style={{ color: `var(--${tone})` }}
        />
      </div>
      <div className="mt-2 text-3xl font-display font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Seg({ pct, color }: { pct: number; color: string }) {
  return <div style={{ width: `${pct}%`, background: color }} className="h-full" />;
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function ScoreChip({ v }: { v: number }) {
  const tone = v >= 80 ? "success" : v >= 60 ? "warn" : "danger";
  return (
    <span
      className="inline-flex tabular-nums rounded-md px-2 py-0.5 text-sm font-semibold"
      style={{
        background: `var(--${tone}-soft)`,
        color: `var(--${tone})`,
      }}
    >
      {v}
    </span>
  );
}

function ActivityCard({
  title,
  time,
  color,
}: {
  title: string;
  time: string;
  color: "success" | "info" | "warn";
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div
        className="h-1.5 w-10 rounded-full mb-3"
        style={{ background: `var(--${color})` }}
      />
      <div className="font-medium">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{time}</div>
    </div>
  );
}
