"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pedidos", label: "Pedidos", icon: Package },
  { href: "/produtos", label: "Produtos", icon: ShoppingBag },
  { href: "/status", label: "Sistema", icon: Activity },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings },
];

const DEFAULT_LOGO = "E";

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");

  useEffect(() => {
    fetch("/api/configuracoes/publicas")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setLogoUrl(json.data.empresa_logo || "");
          setEmpresaNome(json.data.empresa_nome || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
      style={{ backgroundColor: "#F5F5F5" }}
    >
      {/* Logo */}
      <div className="flex w-full items-center justify-center py-4">
        <Link href="/dashboard" className="block">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={empresaNome}
              className="sidebar-logo"
            />
          ) : (
            <div className="sidebar-logo-default">{DEFAULT_LOGO}</div>
          )}
        </Link>
      </div>

      <div className="mx-3 h-px bg-slate-200" />

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[36px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400 shadow-sm transition-all hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2.5 py-3">
        {!collapsed && (
          <p className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Menu
          </p>
        )}
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-all duration-150",
                isActive
                  ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-800"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              >
                <item.icon className="h-[16px] w-[16px]" />
              </div>

              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="mx-2.5 mb-1.5 rounded-lg border border-slate-200 bg-white p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-xs font-bold text-white">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-slate-700">
                Admin
              </p>
              <p className="truncate text-[10px] text-slate-400">
                admin@payflow.com
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-slate-200 p-2.5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
            <LogOut className="h-[16px] w-[16px]" />
          </div>
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
