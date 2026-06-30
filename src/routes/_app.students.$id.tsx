import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { students } from "@/lib/savod/data";
import { useSavod } from "@/lib/savod/store";

export const Route = createFileRoute("/_app/students/$id")({
  component: StudentProfile,
});

function StudentProfile() {
  const { id } = Route.useParams();
  const student = students.find((s) => s.id === id);
  const results = useSavod((s) =>
    s.results.filter((r) => r.studentId === id),
  );

  if (!student) throw notFound();

  const trend = student.trend ?? [];

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
      <Link
        to="/students"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← O‘quvchilar
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {student.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {student.classroom} · {student.age} yosh · So‘nggi baholash: {student.lastAssessmentDate}
          </p>
        </div>
        <Link
          to="/assessment/setup"
          className="rounded-full bg-navy text-white px-4 py-2 text-sm hover:opacity-90"
        >
          Yangi baholash
        </Link>
      </div>

      {student.scores && (
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Stat label="Dekodlash" value={student.scores.decoding} tone="success" />
          <Stat label="Ravonlik" value={student.scores.fluency} tone="info" />
          <Stat
            label="Tushunish"
            value={student.scores.comprehension}
            tone={student.scores.comprehension >= 70 ? "success" : "warn"}
          />
        </div>
      )}

      {trend.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Baholashlar dinamikasi</h2>
          <div className="mt-4 rounded-2xl border bg-card p-6">
            <TrendChart data={trend} />
            <div className="mt-4 rounded-lg bg-warn-soft p-3 text-sm flex items-start gap-2">
              <span className="text-warn">●</span>
              Oxirgi uchta baholashda ravonlik barqaror, ammo sabab-natija savollaridagi natija
              pastligicha qolgan.
            </div>
          </div>
        </section>
      )}

      <section className="mt-10 grid md:grid-cols-2 gap-6">
        <Card title="Takroriy zaif tomonlar">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><span className="text-warn">●</span> Sabab-natija bog‘lanishini og‘zaki tushuntirish</li>
            <li className="flex items-start gap-2"><span className="text-warn">●</span> Mantiqiy savollarga qisqa javob</li>
          </ul>
        </Card>
        <Card title="Tavsiya etilgan mashqlar">
          <ul className="space-y-2 text-sm">
            <li>· Sabab va natija zanjiri (haftasiga 3 marta)</li>
            <li>· “Chunki” va “shuning uchun” gap tuzish</li>
            <li>· Voqealarni kartochkalarda joylash</li>
          </ul>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Baholashlar tarixi</h2>
        <div className="mt-4 rounded-2xl border bg-card divide-y">
          {results.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">
              Hali baholashlar mavjud emas. Birinchi baholashni boshlang.
            </div>
          )}
          {results.map((r) => (
            <div key={r.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
              <div>
                <div className="font-medium">{r.passageTitle}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(r.date).toLocaleString("uz")}
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <Tag label="D" v={r.scores.decoding} />
                <Tag label="R" v={r.scores.fluency} />
                <Tag label="T" v={r.scores.comprehension} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">O‘qituvchi izohlari</h2>
        <textarea
          className="mt-3 w-full rounded-xl border bg-card p-4 text-sm min-h-[100px]"
          placeholder="O‘quvchi haqida o‘z kuzatuvlaringizni yozing..."
        />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warn" | "info";
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div
        className="mt-1 text-4xl font-display font-bold tabular-nums"
        style={{ color: `var(--${tone})` }}
      >
        {value}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function Tag({ label, v }: { label: string; v: number }) {
  const tone = v >= 80 ? "success" : v >= 60 ? "warn" : "danger";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
      style={{
        background: `var(--${tone}-soft)`,
        color: `var(--${tone})`,
      }}
    >
      {label} {v}
    </span>
  );
}

function TrendChart({
  data,
}: {
  data: Array<{ decoding: number; fluency: number; comprehension: number }>;
}) {
  const w = 600;
  const h = 200;
  const pad = 30;
  const xs = data.map((_, i) => pad + (i * (w - pad * 2)) / (data.length - 1 || 1));
  const yScale = (v: number) => h - pad - ((v / 100) * (h - pad * 2));

  const line = (key: keyof typeof data[number], color: string) => {
    const pts = data.map((d, i) => `${xs[i]},${yScale(d[key])}`).join(" ");
    return (
      <>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          points={pts}
        />
        {data.map((d, i) => (
          <circle key={i} cx={xs[i]} cy={yScale(d[key])} r="4" fill={color} />
        ))}
      </>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={pad} x2={w - pad} y1={yScale(g)} y2={yScale(g)} stroke="var(--border)" strokeDasharray="3 3" />
            <text x="4" y={yScale(g) + 4} fontSize="10" fill="var(--muted-foreground)">{g}</text>
          </g>
        ))}
        {line("decoding", "var(--success)")}
        {line("fluency", "var(--info)")}
        {line("comprehension", "var(--warn)")}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--success)" }} /> Dekodlash</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--info)" }} /> Ravonlik</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--warn)" }} /> Tushunish</span>
      </div>
    </div>
  );
}
