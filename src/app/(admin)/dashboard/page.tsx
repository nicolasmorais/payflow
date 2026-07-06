"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  CalendarDays,
  Truck,
  CalendarClock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  totalPedidos: number;
  pedidosHoje: number;
  pedidosOntem: number;
  entregasHoje: number;
  entregasAmanha: number;
  pedidosConcluidos: number;
  pedidosCancelados: number;
  pedidosPorDia: { date: string; count: number }[];
  pedidosPorCidade: { cidade: string; count: number }[];
  evolucaoMensal: { month: string; total: number; receita: number }[];
  pedidosPorStatus: { status: string; count: number }[];
  topProdutos: { produto: string; count: number; receita: number }[];
  receitaTotal: number;
  receitaHoje: number;
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "#f59e0b",
  confirmado: "#3b82f6",
  em_preparacao: "#8b5cf6",
  saiu_entrega: "#06b6d4",
  entregue: "#10b981",
  cancelado: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  em_preparacao: "Em Preparacao",
  saiu_entrega: "Saiu para Entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#ef4444"];

function StatCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
      <p className="font-semibold">{label}</p>
      <p className="text-blue-300">{payload[0].value} pedidos</p>
    </div>
  );
}

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
      <p className="font-semibold">{label}</p>
      <p className="text-emerald-300">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const qs = params.toString();
      const res = await fetch(`/api/dashboard${qs ? `?${qs}` : ""}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="mb-8">
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
              <CardContent><Skeleton className="h-[280px] w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  const statCards = [
    { label: "Pedidos Hoje", value: data.pedidosHoje, icon: CalendarDays, bg: "bg-blue-50", iconBg: "bg-blue-500" },
    { label: "Pedidos Ontem", value: data.pedidosOntem, icon: CalendarClock, bg: "bg-indigo-50", iconBg: "bg-indigo-500" },
    { label: "Entregas Hoje", value: data.entregasHoje, icon: Truck, bg: "bg-cyan-50", iconBg: "bg-cyan-500" },
    { label: "Entregas Amanha", value: data.entregasAmanha, icon: CalendarClock, bg: "bg-sky-50", iconBg: "bg-sky-500" },
    { label: "Receita Hoje", value: data.receitaHoje, icon: DollarSign, bg: "bg-emerald-50", iconBg: "bg-emerald-500", isCurrency: true },
    { label: "Total Pedidos", value: data.totalPedidos, icon: Package, bg: "bg-violet-50", iconBg: "bg-violet-500" },
    { label: "Concluidos", value: data.pedidosConcluidos, icon: CheckCircle2, bg: "bg-teal-50", iconBg: "bg-teal-500" },
    { label: "Cancelados", value: data.pedidosCancelados, icon: XCircle, bg: "bg-rose-50", iconBg: "bg-rose-500" },
  ];

  const pedidosPorDiaChart = data.pedidosPorDia.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
  }));

  const statusOrder = ["pendente", "confirmado", "em_preparacao", "saiu_entrega", "entregue", "cancelado"];
  const statusChart = [...data.pedidosPorStatus]
    .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))
    .map((s) => ({ name: STATUS_LABELS[s.status] || s.status, value: s.count }));

  const top10 = data.pedidosPorCidade.slice(0, 10);

  const evolucaoChart = data.evolucaoMensal.map((m) => {
    const [y, mo] = m.month.split("-");
    return {
      label: new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      total: m.total,
      receita: m.receita,
    };
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 ml-[52px]">
            Visao geral dos pedidos e entregas
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-4 py-2.5 shadow-sm">
          <CalendarDays className="h-4 w-4 text-blue-500" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer"
          />
          <span className="text-muted-foreground text-sm mx-1">ate</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="ml-2 text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.iconBg} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-gray-900 leading-tight">
                      {card.isCurrency
                        ? formatCurrency(card.value)
                        : card.value.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Row 1: Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold text-gray-700">Pedidos por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pedidosPorDiaChart} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                  <Bar dataKey="count" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold text-gray-700">Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChart}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusChart.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => <span className="text-xs text-gray-600 ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Area charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold text-gray-700">Evolucao Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucaoChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} fill="url(#blueArea)" dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold text-gray-700">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucaoChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <defs>
                    <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2.5} fill="url(#greenArea)" dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Cities + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold text-gray-700">Pedidos por Cidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="cidade" tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                  <Bar dataKey="count" fill="url(#blueGradient2)" radius={[0, 6, 6, 0]} />
                  <defs>
                    <linearGradient id="blueGradient2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
              Top Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProdutos.map((p, i) => {
                const maxCount = data.topProdutos[0]?.count || 1;
                const pct = (p.count / maxCount) * 100;
                return (
                  <div key={p.produto}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">{p.produto}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(p.receita)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium w-16 text-right">{p.count} pedidos</span>
                    </div>
                  </div>
                );
              })}
              {data.topProdutos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum produto registrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
