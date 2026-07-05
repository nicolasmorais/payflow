"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Database,
  Server,
  HardDrive,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  MemoryStick,
  Package,
  Users,
  Settings,
  History,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface MemoryInfo {
  rss: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
}

interface DatabaseTables {
  pedidos: number;
  users: number;
  configuracoes: number;
  historico_pedidos: number;
}

interface DatabaseInfo {
  status: string;
  latency?: number;
  version?: string;
  size?: string;
  tables?: DatabaseTables;
  latestPedido?: string | null;
  error?: string;
}

interface PerformanceInfo {
  totalLatency: number;
}

interface StatusData {
  status: string;
  timestamp: string;
  uptime: number;
  memory: MemoryInfo;
  database: DatabaseInfo;
  performance: PerformanceInfo;
  environment: string;
  nodeVersion: string;
  platform: string;
}

interface StatusResponse {
  success: boolean;
  data: StatusData;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(" ");
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function StatusCardSkeleton() {
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

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchStatus = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setFetchError(null);
      const res = await fetch("/api/status");
      const json: StatusResponse = await res.json();
      // Always set data if present, even on error (API returns data in both cases)
      if (json.data) {
        setData(json.data);
      }
      if (!json.success && json.data?.database?.error) {
        setFetchError(json.data.database.error);
      } else if (!json.success) {
        setFetchError("O servidor retornou um status não saudável");
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Erro ao carregar status:", err);
      setFetchError(
        err instanceof Error
          ? `Falha na conexão: ${err.message}`
          : "Erro desconhecido ao conectar com o servidor"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => fetchStatus(true), 30000);
    return () => clearInterval(interval);
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
            <StatusCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StatusCardSkeleton />
          <StatusCardSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {fetchError || "Erro ao carregar dados de status"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => fetchStatus(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const isHealthy = data.status === "healthy";
  const dbConnected = data.database.status === "connected";

  const systemCards = [
    {
      label: "Status do Sistema",
      value: isHealthy ? "Saudável" : "Com Problemas",
      icon: isHealthy ? CheckCircle2 : XCircle,
      bgClass: isHealthy ? "bg-emerald-100" : "bg-red-100",
      textClass: isHealthy ? "text-emerald-600" : "text-red-600",
      badge: isHealthy ? "online" : "offline",
    },
    {
      label: "Status do Banco",
      value: dbConnected ? "Conectado" : "Desconectado",
      icon: Database,
      bgClass: dbConnected ? "bg-blue-100" : "bg-red-100",
      textClass: dbConnected ? "text-blue-600" : "text-red-600",
      badge: dbConnected ? "online" : "offline",
    },
    {
      label: "Uptime",
      value: formatUptime(data.uptime),
      icon: Clock,
      bgClass: "bg-purple-100",
      textClass: "text-purple-600",
    },
    {
      label: "Latência do Banco",
      value: data.database.latency ? `${data.database.latency}ms` : "N/A",
      icon: Zap,
      bgClass: "bg-amber-100",
      textClass: "text-amber-600",
    },
    {
      label: "Memória RSS",
      value: `${data.memory.rss} MB`,
      icon: MemoryStick,
      bgClass: "bg-orange-100",
      textClass: "text-orange-600",
    },
    {
      label: "Heap Usado",
      value: `${data.memory.heapUsed} / ${data.memory.heapTotal} MB`,
      icon: HardDrive,
      bgClass: "bg-cyan-100",
      textClass: "text-cyan-600",
    },
  ];

  const tableStats = data.database.tables
    ? [
        {
          label: "Pedidos",
          value: data.database.tables.pedidos,
          icon: Package,
        },
        { label: "Usuários", value: data.database.tables.users, icon: Users },
        {
          label: "Configurações",
          value: data.database.tables.configuracoes,
          icon: Settings,
        },
        {
          label: "Histórico",
          value: data.database.tables.historico_pedidos,
          icon: History,
        },
      ]
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Status do Sistema
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitoramento em tempo real da saúde do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Última atualização: {formatDate(lastRefresh.toISOString())}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Atenção: problema detectado
            </p>
            <p className="text-sm text-red-600">{fetchError}</p>
          </div>
        </div>
      )}

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {systemCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${card.bgClass}`}>
                    <Icon className={`h-6 w-6 ${card.textClass}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-gray-900">
                        {card.value}
                      </p>
                      {card.badge && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            card.badge === "online"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {card.badge === "online" ? "● Online" : "● Offline"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Database Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Detalhes do Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Versão</p>
                  <p className="text-sm font-medium text-gray-900">
                    {data.database.version || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tamanho</p>
                  <p className="text-sm font-medium text-gray-900">
                    {data.database.size || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Latência</p>
                  <p className="text-sm font-medium text-gray-900">
                    {data.database.latency
                      ? `${data.database.latency}ms`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Último Pedido</p>
                  <p className="text-sm font-medium text-gray-900">
                    {data.database.latestPedido
                      ? formatDate(data.database.latestPedido)
                      : "Nenhum"}
                  </p>
                </div>
              </div>

              {data.database.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    <strong>Erro:</strong> {data.database.error}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Server className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ambiente</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {data.environment}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Node.js</p>
                  <p className="text-sm font-medium text-gray-900">
                    {data.nodeVersion}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plataforma</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {data.platform}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Latência Total</p>
                  <p className="text-sm font-medium text-gray-900">
                    {data.performance.totalLatency}ms
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Uso de Memória</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Heap</span>
                      <span className="text-gray-900 font-medium">
                        {data.memory.heapUsed} / {data.memory.heapTotal} MB
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(data.memory.heapUsed / data.memory.heapTotal) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">RSS</span>
                      <span className="text-gray-900 font-medium">
                        {data.memory.rss} MB
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((data.memory.rss / 512) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Tables Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Registros no Banco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {tableStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {stat.value.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Memory Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MemoryStick className="h-5 w-5" />
              Detalhes de Memória
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  label: "RSS (Resident Set Size)",
                  value: data.memory.rss,
                  color: "bg-blue-500",
                },
                {
                  label: "Heap Total",
                  value: data.memory.heapTotal,
                  color: "bg-green-500",
                },
                {
                  label: "Heap Usado",
                  value: data.memory.heapUsed,
                  color: "bg-yellow-500",
                },
                {
                  label: "Externo",
                  value: data.memory.external,
                  color: "bg-purple-500",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">
                      {item.value} MB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`${item.color} h-1.5 rounded-full transition-all`}
                      style={{
                        width: `${Math.min((item.value / data.memory.rss) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
