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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navGroups = [
  {
    label: "Visão Geral",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/pedidos", label: "Pedidos", icon: Package },
      { href: "/produtos", label: "Produtos", icon: ShoppingBag },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/status", label: "Status", icon: Activity },
      { href: "/configuracoes", label: "Configuracoes", icon: Settings },
    ],
  },
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
    <aside className="sidebar" style={{ width: collapsed ? 72 : 220 }}>
      {/* Logo */}
      <div style={{ padding: "16px 16px 8px", textAlign: "center" }}>
        <Link href="/dashboard" style={{ display: "inline-block" }}>
          {logoUrl ? (
            <img src={logoUrl} alt={empresaNome} className="sidebar-logo" />
          ) : (
            <div className="sidebar-logo-default">{DEFAULT_LOGO}</div>
          )}
        </Link>
      </div>

      <button onClick={onToggle} className="sidebar-toggle">
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <span className="sidebar-section-label">{group.label}</span>
            )}
            {group.items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                >
                  <item.icon />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">A</div>
            <div>
              <p className="sidebar-user-name">Admin</p>
              <p className="sidebar-user-email">admin@payflow.com</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-logout" style={{ marginTop: 8 }}>
          <LogOut />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
