import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  ClipboardCheck,
  Users,
  PieChart,
  BookOpen,
  FileBarChart,
  Settings,
} from "lucide-react";
import { SavodLogo } from "./SavodLogo";
import { teacher } from "@/lib/savod/data";

const items: Array<{
  to: string;
  label: string;
  icon: typeof Home;
  disabled?: boolean;
}> = [
  { to: "/dashboard", label: "Bosh sahifa", icon: Home },
  { to: "/assessment/setup", label: "Baholash", icon: ClipboardCheck },
  { to: "/students", label: "O‘quvchilar", icon: Users },
  { to: "/dashboard", label: "Sinf tahlili", icon: PieChart, disabled: true },
  { to: "/dashboard", label: "Matnlar", icon: BookOpen, disabled: true },
  { to: "/dashboard", label: "Hisobotlar", icon: FileBarChart, disabled: true },
  { to: "/dashboard", label: "Sozlamalar", icon: Settings, disabled: true },
];

export function DashboardSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-sidebar text-sidebar-foreground min-h-screen sticky top-0">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2 font-display font-bold text-sidebar-foreground">
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-sidebar-foreground">
            <span className="text-[10px] font-semibold">360</span>
          </span>
          <span className="text-lg">Savod<span className="text-sidebar-primary">360</span></span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item, i) => {
          const Icon = item.icon;
          const active =
            !item.disabled &&
            (pathname === item.to ||
              (item.to !== "/dashboard" && pathname.startsWith(item.to)));
          return (
            <Link
              key={i}
              to={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60"
              } ${item.disabled ? "opacity-60 pointer-events-none" : ""}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-sidebar-primary/90 text-sidebar-primary-foreground flex items-center justify-center text-sm font-semibold">
            DK
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{teacher.name}</div>
            <div className="text-xs text-sidebar-foreground/60 truncate">
              {teacher.school}
            </div>
            <div className="text-xs text-sidebar-foreground/60">{teacher.classroom}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
