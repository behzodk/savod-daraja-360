import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SavodLogo } from "@/components/savod/SavodLogo";
import { AssessmentProgress } from "@/components/savod/AssessmentProgress";
import { useRouterState, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/assessment")({
  component: AssessmentLayout,
});

function AssessmentLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const seg = pathname.split("/")[2] ?? "setup";
  const current = (["setup", "reading", "retelling", "question", "result"].includes(seg)
    ? seg
    : "setup") as "setup" | "reading" | "retelling" | "question" | "result";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <SavodLogo />
          <AssessmentProgress current={current} />
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Chiqish
          </Link>
        </div>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
