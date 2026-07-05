"use client";

import { usePathname } from "next/navigation";
import { Menu, LogOut, User, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuToggle: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pedidos": "Pedidos",
  "/produtos": "Produtos",
  "/status": "Status do Sistema",
  "/configuracoes": "Configuracoes",
};

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const title =
    pageTitles[pathname] ||
    (pathname.startsWith("/pedidos/") ? "Detalhes do Pedido" : "PayFlow");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-slate-100">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-500/25">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer rounded-lg text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
