import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { students } from "@/lib/savod/data";
import type { ProfileNeed } from "@/lib/savod/types";

export const Route = createFileRoute("/_app/students")({
  component: StudentsPage,
});

const filters: { id: string; label: string }[] = [
  { id: "all", label: "Barcha o‘quvchilar" },
  { id: "decoding", label: "Dekodlash" },
  { id: "fluency", label: "Ravonlik" },
  { id: "comprehension", label: "Tushunish" },
  { id: "7d", label: "Oxirgi 7 kun" },
  { id: "30d", label: "Oxirgi 30 kun" },
];

const groups: { title: string; need: ProfileNeed; tone: string }[] = [
  { title: "1-guruh: So‘zlarni tanish", need: "Dekodlash yordami kerak", tone: "danger" },
  { title: "2-guruh: Ravon o‘qish", need: "Ravonlik yordami kerak", tone: "info" },
  { title: "3-guruh: Mazmuniy bog‘lanish", need: "Tushunish yordami kerak", tone: "warn" },
  { title: "4-guruh: Mustaqil o‘quvchilar", need: "Mustaqil o‘quvchi", tone: "success" },
];

function StudentsPage() {
  const [filter, setFilter] = useState("all");

  const visible = students.filter((s) => {
    if (filter === "decoding") return s.profile === "Dekodlash yordami kerak";
    if (filter === "fluency") return s.profile === "Ravonlik yordami kerak";
    if (filter === "comprehension") return s.profile === "Tushunish yordami kerak";
    return true;
  });

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      <h1 className="font-display text-3xl font-bold tracking-tight">O‘quvchilar</h1>
      <p className="text-muted-foreground mt-1">
        Sinf bo‘yicha o‘qish profillari va guruhlash.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              filter === f.id
                ? "bg-navy text-white border-navy"
                : "hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">O‘quvchi</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">So‘nggi baholash</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Dekodlash</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Ravonlik</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Tushunish</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">O‘qish profili</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Tavsiya</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">
                  <Link
                    to="/students/$id"
                    params={{ id: s.id }}
                    className="hover:underline"
                  >
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.lastAssessmentDate ?? "—"}
                </td>
                <td className="px-4 py-3"><Chip v={s.scores?.decoding} /></td>
                <td className="px-4 py-3"><Chip v={s.scores?.fluency} /></td>
                <td className="px-4 py-3"><Chip v={s.scores?.comprehension} /></td>
                <td className="px-4 py-3">
                  <ProfileBadge profile={s.profile} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {recommendation(s.profile)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Guruhlar</h2>
        <p className="text-sm text-muted-foreground">
          Sinfingizni o‘qish profili bo‘yicha guruhlang.
        </p>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((g) => {
            const list = students.filter((s) => s.profile === g.need);
            return (
              <div key={g.title} className="rounded-2xl border bg-card p-5">
                <div
                  className="h-1.5 w-10 rounded-full mb-3"
                  style={{ background: `var(--${g.tone})` }}
                />
                <div className="font-display font-semibold">{g.title}</div>
                <div className="text-xs text-muted-foreground mt-1 mb-3">
                  {list.length} o‘quvchi
                </div>
                <ul className="space-y-1 text-sm">
                  {list.slice(0, 5).map((s) => (
                    <li key={s.id}>
                      <Link
                        to="/students/$id"
                        params={{ id: s.id }}
                        className="hover:underline"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                  {list.length > 5 && (
                    <li className="text-xs text-muted-foreground">
                      +{list.length - 5} boshqalar
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Chip({ v }: { v?: number }) {
  if (v === undefined) return <span className="text-muted-foreground">—</span>;
  const tone = v >= 80 ? "success" : v >= 60 ? "warn" : "danger";
  return (
    <span
      className="inline-flex rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums"
      style={{
        background: `var(--${tone}-soft)`,
        color: `var(--${tone})`,
      }}
    >
      {v}
    </span>
  );
}

function ProfileBadge({ profile }: { profile: ProfileNeed }) {
  const tone =
    profile === "Mustaqil o‘quvchi"
      ? "success"
      : profile === "Ravonlik yordami kerak"
        ? "info"
        : profile === "Tushunish yordami kerak"
          ? "warn"
          : profile === "Dekodlash yordami kerak"
            ? "danger"
            : "info";
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        background: `var(--${tone}-soft)`,
        color: `var(--${tone})`,
      }}
    >
      {profile}
    </span>
  );
}

function recommendation(p: ProfileNeed): string {
  switch (p) {
    case "Mustaqil o‘quvchi":
      return "Qiyinroq matn taklif qiling";
    case "Ravonlik yordami kerak":
      return "Takroriy o‘qish mashqi";
    case "Tushunish yordami kerak":
      return "Sabab-natija zanjiri";
    case "Dekodlash yordami kerak":
      return "So‘zlarni tanish mashqi";
    default:
      return "Qayta baholash";
  }
}
