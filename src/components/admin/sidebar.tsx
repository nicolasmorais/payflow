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
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
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

const MOBILE_LOGO = "https://pub-da9fd1c19b8e45d691d67626b9a7ba6d.r2.dev/1783334525509-95d786c5-293c-41f5-b2b8-e87d2be741ca-(1)-(1)-(1).png";
const DEFAULT_LOGO = "E";

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileToggle }: SidebarProps) {
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
    onMobileToggle();
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      onMobileToggle();
    }
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="sidebar-hamburger"
        onClick={onMobileToggle}
        aria-label="Menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileToggle} />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}
        style={{ width: collapsed ? 72 : 220 }}
      >
        {/* Logo */}
        <div style={{ padding: "16px 16px 8px", textAlign: "center" }}>
          <Link href="/dashboard" style={{ display: "inline-block" }} onClick={handleNavClick}>
            {collapsed ? (
              <img src={MOBILE_LOGO} alt="Logo" className="sidebar-logo-icon" />
            ) : logoUrl ? (
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
                    onClick={handleNavClick}
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
    </>
  );
}
