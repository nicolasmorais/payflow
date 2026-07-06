"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-manrope">
      {/* Sidebar */}
      <Sidebar
        collapsed={isMobile ? true : collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen(!mobileOpen)}
      />

      {/* Main content */}
      <div
        className="main-content"
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 72 : 220,
          transition: "margin-left 0.3s",
        }}
      >
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
