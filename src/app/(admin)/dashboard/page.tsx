"use client";

import { useEffect, useState } from "react";
import {
  Package,
  CalendarDays,
  Truck,
  CalendarClock,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PedidosPorDia {
  date: string;
  count: number;
}

interface PedidosPorCidade {
  cidade: string;
  count: number;
}

interface EvolucaoMensal {
  month: string;
  count: number;
}

interface PedidosPorStatus {
  status: string;
  count: number;
}

interface DashboardData {
  totalPedidos: number;
  pedidosHoje: number;
  entregasHoje: number;
  entregasAmanha: number;
  pedidosConcluidos: number;
  pedidosCancelados: number;
  pedidosPorDia: PedidosPorDia[];
  pedidosPorCidade: PedidosPorCidade[];
  evolucaoMensal: EvolucaoMensal[];
  pedidosPorStatus: PedidosPorStatus[];
}

interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "#eab308",
  confirmado: "#3b82f6",
  em_preparacao: "#f97316",
  saiu_entrega: "#a855f7",
  entregue: "#22c55e",
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

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) return;
        const json: DashboardResponse = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total de Pedidos",
      value: data.totalPedidos,
      icon: Package,
      bgClass: "bg-blue-100",
      textClass: "text-blue-600",
    },
    {
      label: "Pedidos do Dia",
      value: data.pedidosHoje,
      icon: CalendarDays,
      bgClass: "bg-green-100",
      textClass: "text-green-600",
    },
    {
      label: "Entregas de Hoje",
      value: data.entregasHoje,
      icon: Truck,
      bgClass: "bg-orange-100",
      textClass: "text-orange-600",
    },
    {
      label: "Entregas de Amanha",
      value: data.entregasAmanha,
      icon: CalendarClock,
      bgClass: "bg-purple-100",
      textClass: "text-purple-600",
    },
    {
      label: "Pedidos Concluidos",
      value: data.pedidosConcluidos,
      icon: CheckCircle2,
      bgClass: "bg-emerald-100",
      textClass: "text-emerald-600",
    },
    {
      label: "Pedidos Cancelados",
      value: data.pedidosCancelados,
      icon: XCircle,
      bgClass: "bg-red-100",
      textClass: "text-red-600",
    },
  ];

  const pedidosPorDiaData = {
    labels: data.pedidosPorDia.map((item) => {
      const d = new Date(item.data + "T00:00:00");
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    }),
    datasets: [
      {
        label: "Pedidos",
        data: data.pedidosPorDia.map((item) => item.total),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const pedidosPorDiaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  const statusOrder = [
    "pendente",
    "confirmado",
    "em_preparacao",
    "saiu_entrega",
    "entregue",
    "cancelado",
  ];

  const sortedStatusData = [...data.pedidosPorStatus].sort((a, b) => {
    return statusOrder.indexOf(a.statusKey) - statusOrder.indexOf(b.statusKey);
  });

  const statusDoughnutData = {
    labels: sortedStatusData.map(
      (item) => STATUS_LABELS[item.statusKey] || item.status
    ),
    datasets: [
      {
        data: sortedStatusData.map((item) => item.total),
        backgroundColor: sortedStatusData.map(
          (item) => STATUS_COLORS[item.statusKey] || "#94a3b8"
        ),
        borderColor: "hsl(var(--card))",
        borderWidth: 2,
      },
    ],
  };

  const statusDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 },
      },
      title: { display: false },
    },
  };

  const top10Cidades = data.pedidosPorCidade.slice(0, 10);

  const cidadeBarData = {
    labels: top10Cidades.map((item) => item.cidade),
    datasets: [
      {
        label: "Pedidos",
        data: top10Cidades.map((item) => item.total),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const cidadeBarOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  };

  const evolucaoMensalData = {
    labels: data.evolucaoMensal.map((item) => {
      const [year, month] = item.mes.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });
    }),
    datasets: [
      {
        label: "Pedidos",
        data: data.evolucaoMensal.map((item) => item.total),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const evolucaoMensalOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Visao geral dos pedidos e entregas
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${card.bgClass}`}>
                    <Icon className={`h-6 w-6 ${card.textClass}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.value.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pedidos por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Pedidos por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={pedidosPorDiaData} options={pedidosPorDiaOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Status dos Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Status dos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Doughnut
                data={statusDoughnutData}
                options={statusDoughnutOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pedidos por Cidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Pedidos por Cidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={cidadeBarData} options={cidadeBarOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Evolucao Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Evolucao Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                data={evolucaoMensalData}
                options={evolucaoMensalOptions}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
