import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mic,
  CheckCircle2,
  X,
  Timer,
  Network,
  BookOpenText,
  Waves,
  Lightbulb,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { SavodLogo } from "@/components/savod/SavodLogo";
import { ScoreCard } from "@/components/savod/ScoreCard";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <SavodLogo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground">Qanday ishlaydi</a>
            <a href="#teacher" className="hover:text-foreground">O‘qituvchi uchun</a>
            <a href="#results" className="hover:text-foreground">Natijalar</a>
            <a href="#problem" className="hover:text-foreground">Muammo</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/assessment/setup"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-navy text-white px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Demoni ko‘rish <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-info-soft text-info font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Boshlang‘ich sinflar uchun 90 soniyalik diagnostika
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
            Bola matnni ravon o‘qishi mumkin.
            <br />
            <span className="text-muted-foreground">Ammo bu uni tushundi degani emas.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Savod360 o‘qishdagi muammoning qayerda boshlanishini ko‘rsatadi: so‘zlarni tanishda,
            ravonlikda yoki mazmunni tushunishda.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/assessment/setup"
              className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-5 py-3 font-medium hover:opacity-90"
            >
              <Mic className="h-4 w-4" /> Baholashni boshlash
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-3 font-medium hover:bg-muted"
            >
              O‘qituvchi panelini ko‘rish
            </Link>
          </div>
        </div>

        <HeroMockup />
      </section>

      {/* Comparison */}
      <section id="problem" className="bg-card border-y">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight max-w-2xl">
            Bir xil tezlik. Ikki xil ehtiyoj.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Ikki o‘quvchining o‘qish tezligi yaqin. Ammo ulardan biri matn mazmunini tushunmaydi.
          </p>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <CompareCard
              name="Madina"
              speed="86 so‘z/min"
              style="Sekinroq, ayrim pauzalar bilan"
              understanding={91}
              tone="success"
              diagnosis={[
                "Matn mazmunini yaxshi tushundi",
                "Ravon o‘qish mashqlari tavsiya etiladi",
              ]}
            />
            <CompareCard
              name="Aziz"
              speed="95 so‘z/min"
              style="Ravon va ishonchli"
              understanding={47}
              tone="warn"
              diagnosis={[
                "Voqealarni eslab qoldi",
                "Sabab va natija bog‘lanishini tushuntira olmadi",
              ]}
            />
          </div>

          <div className="mt-10 rounded-2xl border-2 border-dashed border-navy/30 bg-background p-6 text-center">
            <p className="font-display text-2xl md:text-3xl font-semibold">
              Tez o‘qish har doim ham tushunib o‘qish emas.
            </p>
          </div>
        </div>
      </section>

      {/* Three dimensions */}
      <section id="results" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <div className="text-sm font-medium text-info uppercase tracking-wider">
            Uchta o‘lchov
          </div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight">
            O‘qish bitta jarayon emas. Uchta alohida ko‘nikma.
          </h2>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <DimensionCard
            icon={BookOpenText}
            tone="success"
            title="Dekodlash"
            description="Qaysi so‘zlar to‘g‘ri o‘qildi, tashlab ketildi, takrorlandi yoki almashtirildi?"
            visual={
              <div className="reading-text text-base leading-relaxed">
                <span style={{ color: "var(--success)" }}>maktabga </span>
                <span className="text-danger line-through decoration-2">uyda </span>
                <span style={{ color: "var(--success)" }}>qoldirganini </span>
                <span className="text-danger">avtobus</span>
                <span className="ml-1 text-xs rounded bg-danger-soft px-1.5 py-0.5 text-danger font-medium">
                  avtobusni
                </span>
              </div>
            }
          />
          <DimensionCard
            icon={Waves}
            tone="info"
            title="Ravonlik"
            description="O‘qish tezligi, pauzalar, ikkilanish va gaplarni mazmunli bo‘lib o‘qish tahlil qilinadi."
            visual={
              <div className="space-y-3">
                <div className="text-2xl font-display font-bold text-info">
                  92 <span className="text-sm text-muted-foreground">so‘z/min</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted">
                  <div className="absolute inset-y-0 left-0 w-3/4 rounded-full bg-info/70" />
                  <div className="absolute -top-1 left-[35%] h-4 w-1.5 rounded-sm bg-warn" />
                  <div className="absolute -top-1 left-[65%] h-4 w-1.5 rounded-sm bg-warn" />
                </div>
                <div className="text-xs text-muted-foreground">2 ta sezilarli pauza</div>
              </div>
            }
          />
          <DimensionCard
            icon={Network}
            tone="warn"
            title="Tushunish"
            description="Bola voqealar ketma-ketligi, asosiy g‘oya, sabab-natija va yashirin ma’noni tushundimi?"
            visual={
              <div className="space-y-2 text-sm">
                <MiniConcept label="Daftar uyda qoldi" detected={false} />
                <MiniConcept label="Akmal uyga qaytdi" detected />
                <MiniConcept label="Avtobus ketdi" detected />
                <MiniConcept label="Akmal kechikdi" detected={false} />
              </div>
            }
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-card border-y">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Qanday ishlaydi
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <StepCard
              n={1}
              title="Ovoz chiqarib o‘qish"
              text="Bola matnni 60 soniya davomida o‘qiydi."
            />
            <StepCard
              n={2}
              title="O‘z so‘zlari bilan aytib berish"
              text="Matn ekrandan yo‘qoladi. Bola eslab qolganini qayta hikoya qiladi."
            />
            <StepCard
              n={3}
              title="Xulosa chiqarish"
              text="Savod360 matnda bevosita yozilmagan bitta mantiqiy savol beradi."
            />
          </div>
          <div className="mt-10 rounded-xl border bg-background p-4 flex flex-wrap items-center justify-between gap-3 text-sm font-medium">
            {["O‘qish", "Qayta hikoya", "Mantiqiy savol", "Natija"].map((s, i, arr) => (
              <div key={s} className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy text-white text-xs">
                  {i + 1}
                </span>
                <span>{s}</span>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* National relevance */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Muammoni 15 yoshda emas, boshlang‘ich sinfdayoq ko‘rish kerak.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Savod360 o‘qituvchiga bolaning qiyinchiligi qaysi bosqichda boshlanganini erta
              aniqlashga yordam beradi.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                Sinf darajasidagi tahlil
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                Maktab bo‘yicha kuzatuv
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                Hududlar kesimidagi anonim ko‘rsatkichlar
              </li>
            </ul>
          </div>
          <UzbekistanCard />
        </div>
      </section>

      {/* Teacher dashboard preview */}
      <section id="teacher" className="bg-card border-y">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-info uppercase tracking-wider">
                O‘qituvchi paneli
              </div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight">
                Sinfingizning o‘qish holatini bir qarashda ko‘ring.
              </h2>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-5 py-2.5 font-medium hover:opacity-90"
            >
              Panelni ochish <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid md:grid-cols-4 gap-4">
            <MiniStat label="O‘quvchilar" value="24" />
            <MiniStat label="Tushunish yordami" value="7" tone="warn" />
            <MiniStat label="Ravonlik yordami" value="4" tone="info" />
            <MiniStat label="Yangi baholash" value="3" tone="success" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          Har bir bolaga bir xil mashq emas,
          <br />
          <span className="text-info">kerakli yordamni bering.</span>
        </h2>
        <div className="mt-8">
          <Link
            to="/assessment/setup"
            className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-6 py-3.5 font-medium hover:opacity-90"
          >
            Savod360 demosini boshlash <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-6 py-10 grid md:grid-cols-4 gap-6 text-sm">
          <div>
            <SavodLogo />
            <p className="mt-3 text-muted-foreground">
              O‘zbekiston maktablari uchun ishlab chiqilgan MVP.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              AI Hackathon Jizzakh 2026
            </p>
          </div>
          <FooterCol title="Mahsulot" items={["Qanday ishlaydi", "Natijalar", "Metodologiya"]} />
          <FooterCol title="Jamoa" items={["Biz haqimizda", "Maxfiylik", "Aloqa"]} />
          <FooterCol title="Aloqa" items={["info@savod360.uz", "Jizzax, O‘zbekiston"]} />
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © 2026 Savod360
        </div>
      </footer>
    </div>
  );
}

function LanguageSwitcher() {
  return (
    <div className="hidden sm:flex items-center gap-1 text-xs rounded-full border px-2 py-1 text-muted-foreground">
      <span className="rounded-full bg-navy text-white px-2 py-0.5">O‘zbekcha</span>
      <span title="Tez orada" className="opacity-60 px-1.5">Русский</span>
      <span title="Tez orada" className="opacity-60 px-1.5">English</span>
    </div>
  );
}

function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border bg-card shadow-xl shadow-navy/5 overflow-hidden"
    >
      <div className="flex items-center gap-2 px-5 py-3 border-b bg-muted/50">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-3 text-xs text-muted-foreground">savod360.uz · Baholash</span>
      </div>
      <div className="p-6">
        <div className="text-xs text-muted-foreground mb-3">
          Azizbek · Akmalning daftari · 3-“A” sinf
        </div>
        <div className="reading-text text-lg leading-relaxed">
          <span style={{ color: "var(--success)" }}>Akmal </span>
          <span style={{ color: "var(--success)" }}>maktabga </span>
          <span className="bg-warn-soft px-1 rounded">ketayotganda </span>
          <span style={{ color: "var(--success)" }}>daftarini </span>
          <span className="text-danger line-through decoration-2">uyda </span>
          <span style={{ color: "var(--success)" }}>qoldirganini </span>
          <span style={{ color: "var(--success)" }}>esladi. </span>
          <span style={{ color: "var(--success)" }}>U tezda ortiga qaytdi. </span>
          <span style={{ color: "var(--success)" }}>Daftarini olib chiqquncha </span>
          <span className="text-danger">avtobus</span>
          <span className="ml-1 text-xs rounded bg-danger-soft px-1.5 py-0.5 text-danger font-medium">
            avtobusni
          </span>{" "}
          <span style={{ color: "var(--success)" }}>ketib qoldi.</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <ScorePill label="Dekodlash" value={94} tone="success" />
          <ScorePill label="Ravonlik" value={88} tone="success" />
          <ScorePill label="Tushunish" value={52} tone="warn" emphasized />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-lg bg-warn-soft p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-warn mt-0.5 shrink-0" />
          <span>Sabab va natija bog‘lanishini mustahkamlash kerak.</span>
        </div>
      </div>
    </motion.div>
  );
}

function ScorePill({
  label,
  value,
  tone,
  emphasized,
}: {
  label: string;
  value: number;
  tone: "success" | "warn" | "danger";
  emphasized?: boolean;
}) {
  const color = `var(--${tone})`;
  const soft = `var(--${tone}-soft)`;
  return (
    <div
      className={`rounded-xl p-3 border ${emphasized ? "ring-2" : ""}`}
      style={{
        background: soft,
        borderColor: emphasized ? color : "transparent",
      }}
    >
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-display font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function CompareCard({
  name,
  speed,
  style,
  understanding,
  tone,
  diagnosis,
}: {
  name: string;
  speed: string;
  style: string;
  understanding: number;
  tone: "success" | "warn";
  diagnosis: string[];
}) {
  const color = `var(--${tone})`;
  return (
    <div className="rounded-2xl border bg-background p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">O‘quvchi</div>
          <div className="font-display text-xl font-semibold">{name}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Tushunish</div>
          <div className="text-2xl font-display font-bold" style={{ color }}>
            {understanding}
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tezlik</span>
          <span className="font-medium">{speed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Uslub</span>
          <span className="font-medium text-right">{style}</span>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm border-t pt-4">
        {diagnosis.map((d, i) => (
          <li key={i} className="flex items-start gap-2">
            {tone === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
            ) : (
              <X className="h-4 w-4 text-warn mt-0.5" />
            )}
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DimensionCard({
  icon: Icon,
  tone,
  title,
  description,
  visual,
}: {
  icon: typeof Timer;
  tone: "success" | "info" | "warn";
  title: string;
  description: string;
  visual: React.ReactNode;
}) {
  const color = `var(--${tone})`;
  const soft = `var(--${tone}-soft)`;
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div
        className="h-10 w-10 rounded-lg flex items-center justify-center"
        style={{ background: soft, color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 rounded-lg border bg-background p-4">{visual}</div>
    </div>
  );
}

function MiniConcept({ label, detected }: { label: string; detected: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-3 py-2 ${
        detected
          ? "bg-success-soft border-success/30"
          : "bg-danger-soft/40 border-danger/30 border-dashed"
      }`}
    >
      <span>{label}</span>
      {detected ? (
        <CheckCircle2 className="h-4 w-4 text-success" />
      ) : (
        <X className="h-4 w-4 text-danger" />
      )}
    </div>
  );
}

function StepCard({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-background p-6">
      <div className="text-5xl font-display font-bold text-muted-foreground/30">
        {n}
      </div>
      <h3 className="mt-2 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function UzbekistanCard() {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
        Hududiy tahlil (namuna)
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          "Jizzax",
          "Toshkent",
          "Samarqand",
          "Buxoro",
          "Andijon",
          "Farg‘ona",
          "Namangan",
          "Xorazm",
          "Qashqadaryo",
        ].map((region, i) => (
          <div
            key={region}
            className="rounded-lg border bg-background p-2 text-xs"
          >
            <div className="font-medium">{region}</div>
            <div
              className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden"
              aria-label={`${region} ko‘rsatkichi`}
            >
              <div
                className="h-full bg-info/70"
                style={{ width: `${40 + (i * 7) % 50}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
        <Lightbulb className="h-3.5 w-3.5 mt-0.5" />
        MVP namunaviy ko‘rsatkichlar. Real ma’lumotlar pilot maktablarda yig‘iladi.
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone = "info",
}: {
  label: string;
  value: string;
  tone?: "info" | "warn" | "success";
}) {
  const color = `var(--${tone})`;
  return (
    <div className="rounded-2xl border bg-background p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div
        className="mt-1 text-3xl font-display font-bold"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="font-medium mb-3">{title}</div>
      <ul className="space-y-2 text-muted-foreground">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

// Unused import shim - keep ScoreCard available
void ScoreCard;
