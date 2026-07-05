"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  FileSpreadsheet,
  FileText,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
  MapPin,
  Phone,
  User,
  ArrowUpDown,
  Download,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Pedido {
  id: string;
  numero: number;
  nome: string;
  telefone: string;
  cpf?: string;
  cidade: string;
  bairro?: string;
  data_entrega: string;
  horario: string;
  produto: string;
  valor: number;
  status:
    | "pendente"
    | "confirmado"
    | "em_preparacao"
    | "saiu_entrega"
    | "entregue"
    | "cancelado";
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "em_preparacao", label: "Em Preparacao" },
  { value: "saiu_entrega", label: "Saiu para Entrega" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
] as const;

const STATUS_CONFIG: Record<
  Pedido["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  pendente: {
    label: "Pendente",
    color: "bg-amber-50 text-amber-700 ring-amber-600/20",
    icon: <Clock className="h-3 w-3" />,
  },
  confirmado: {
    label: "Confirmado",
    color: "bg-blue-50 text-blue-700 ring-blue-600/20",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  em_preparacao: {
    label: "Preparando",
    color: "bg-orange-50 text-orange-700 ring-orange-600/20",
    icon: <Loader2 className="h-3 w-3" />,
  },
  saiu_entrega: {
    label: "A caminho",
    color: "bg-violet-50 text-violet-700 ring-violet-600/20",
    icon: <Truck className="h-3 w-3" />,
  },
  entregue: {
    label: "Entregue",
    color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-50 text-red-700 ring-red-600/20",
    icon: <XCircle className="h-3 w-3" />,
  },
};

const ALL_STATUSES: Pedido["status"][] = [
  "pendente",
  "confirmado",
  "em_preparacao",
  "saiu_entrega",
  "entregue",
  "cancelado",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon,
  color,
  loading,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20 bg-slate-100" />
          ) : (
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              {value}
            </p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [cidade, setCidade] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [today, setToday] = useState(false);
  const [tomorrow, setTomorrow] = useState(false);
  const [page, setPage] = useState(1);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const perPage = 20;

  /* ---- Stats computed from loaded data ---- */
  const stats = {
    total,
    pendentes: pedidos.filter((p) => p.status === "pendente").length,
    emTransito: pedidos.filter(
      (p) => p.status === "saiu_entrega" || p.status === "em_preparacao"
    ).length,
    entregues: pedidos.filter((p) => p.status === "entregue").length,
    receita: pedidos.reduce((acc, p) => {
      if (p.status !== "cancelado") return acc + p.valor;
      return acc;
    }, 0),
  };

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(perPage));
      if (search.trim()) params.set("search", search.trim());
      if (status && status !== "all") params.set("status", status);
      if (cidade.trim()) params.set("cidade", cidade.trim());
      if (dataInicio) params.set("data_inicio", dataInicio);
      if (dataFim) params.set("data_fim", dataFim);
      if (today) params.set("hoje", "true");
      if (tomorrow) params.set("amanha", "true");

      const res = await fetch(`/api/pedidos?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao buscar pedidos");
      const json = await res.json();

      setPedidos(json.data ?? []);
      setTotal(json.pagination?.total ?? 0);
      setTotalPages(json.pagination?.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, cidade, dataInicio, dataFim, today, tomorrow]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setPage(1), 300);
  };

  const toggleToday = () => {
    setToday((p) => !p);
    setTomorrow(false);
    setDataInicio("");
    setDataFim("");
    setPage(1);
  };

  const toggleTomorrow = () => {
    setTomorrow((p) => !p);
    setToday(false);
    setDataInicio("");
    setDataFim("");
    setPage(1);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pedidos/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir pedido");
      toast.success("Pedido excluido com sucesso!");
      setDeleteOpen(false);
      setDeleteId(null);
      fetchPedidos();
    } catch {
      toast.error("Erro ao excluir pedido");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (
    pedidoId: string,
    newStatus: Pedido["status"]
  ) => {
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");
      toast.success(
        `Status alterado para ${STATUS_CONFIG[newStatus].label}`
      );
      fetchPedidos();
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  const handleExport = async (format: "excel" | "csv") => {
    try {
      toast.info(`Gerando arquivo ${format.toUpperCase()}...`);
      const res = await fetch(`/api/pedidos/export?format=${format}`);
      if (!res.ok) throw new Error("Erro ao exportar");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pedidos.${format === "excel" ? "xlsx" : "csv"}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Arquivo exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar pedidos");
    }
  };

  const startItem = (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, total);

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const activeFilters =
    (today ? 1 : 0) +
    (tomorrow ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
    (cidade.trim() ? 1 : 0) +
    (dataInicio ? 1 : 0) +
    (dataFim ? 1 : 0);

  const clearFilters = () => {
    setToday(false);
    setTomorrow(false);
    setStatus("all");
    setCidade("");
    setDataInicio("");
    setDataFim("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Pedidos
            </h1>
            <p className="text-sm text-slate-500">
              {total} {total === 1 ? "registro" : "registros"} encontrado
              {total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => handleExport("excel")}
          >
            <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => handleExport("csv")}
          >
            <FileText className="mr-1.5 h-4 w-4 text-blue-600" />
            CSV
          </Button>
        </div>
      </div>

      {/* ---- Stat Cards ---- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={total}
          icon={<Package className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
          loading={loading}
        />
        <StatCard
          label="Pendentes"
          value={stats.pendentes}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          color="bg-amber-50"
          loading={loading}
        />
        <StatCard
          label="Em Transito"
          value={stats.emTransito}
          icon={<Truck className="h-5 w-5 text-violet-600" />}
          color="bg-violet-50"
          loading={loading}
        />
        <StatCard
          label="Receita"
          value={formatCurrency(stats.receita)}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          color="bg-emerald-50"
          loading={loading}
        />
      </div>

      {/* ---- Search & Filters ---- */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nome, telefone ou numero..."
              className="h-10 rounded-xl border-slate-200 bg-white pl-10 text-sm font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={today ? "default" : "outline"}
              size="sm"
              className={`h-9 rounded-xl font-semibold ${
                today
                  ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              onClick={toggleToday}
            >
              <Calendar className="mr-1 h-3.5 w-3.5" />
              Hoje
            </Button>
            <Button
              variant={tomorrow ? "default" : "outline"}
              size="sm"
              className={`h-9 rounded-xl font-semibold ${
                tomorrow
                  ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              onClick={toggleTomorrow}
            >
              <Calendar className="mr-1 h-3.5 w-3.5" />
              Amanha
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            className="h-9 w-[140px] rounded-xl border-slate-200 bg-white text-sm font-medium"
            value={dataInicio}
            onChange={(e) => {
              setDataInicio(e.target.value);
              setToday(false);
              setTomorrow(false);
              setPage(1);
            }}
          />
          <span className="text-xs font-medium text-slate-400">ate</span>
          <Input
            type="date"
            className="h-9 w-[140px] rounded-xl border-slate-200 bg-white text-sm font-medium"
            value={dataFim}
            onChange={(e) => {
              setDataFim(e.target.value);
              setToday(false);
              setTomorrow(false);
              setPage(1);
            }}
          />

          <div className="h-5 w-px bg-slate-200" />

          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[160px] rounded-xl border-slate-200 bg-white text-sm font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Cidade"
            className="h-9 w-[140px] rounded-xl border-slate-200 bg-white text-sm font-medium placeholder:text-slate-400"
            value={cidade}
            onChange={(e) => {
              setCidade(e.target.value);
              setPage(1);
            }}
          />

          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600"
              onClick={clearFilters}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Limpar ({activeFilters})
            </Button>
          )}
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 bg-slate-50/60 hover:bg-slate-50/60">
                <TableHead className="w-[70px] py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" />
                    #
                  </div>
                </TableHead>
                <TableHead className="py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Cliente
                </TableHead>
                <TableHead className="py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Entrega
                </TableHead>
                <TableHead className="py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Produto
                </TableHead>
                <TableHead className="py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                  Valor
                </TableHead>
                <TableHead className="py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </TableHead>
                <TableHead className="py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                  Acoes
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-slate-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j} className="py-4">
                          <Skeleton className="h-4 w-full bg-slate-100" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : pedidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                        <Package className="h-8 w-8 text-slate-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-slate-600">
                          Nenhum pedido encontrado
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {activeFilters > 0
                            ? "Tente ajustar ou limpar os filtros"
                            : "Os pedidos aparecerao aqui quando forem criados"}
                        </p>
                      </div>
                      {activeFilters > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-semibold"
                          onClick={clearFilters}
                        >
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pedidos.map((pedido) => {
                  const st = STATUS_CONFIG[pedido.status];
                  return (
                    <TableRow
                      key={pedido.id}
                      className="group border-b border-slate-50 transition-colors hover:bg-blue-50/30"
                    >
                      {/* # */}
                      <TableCell>
                        <span className="inline-flex h-7 min-w-[32px] items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-bold text-slate-600">
                          {pedido.numero}
                        </span>
                      </TableCell>

                      {/* Cliente */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-slate-800">
                            {pedido.nome}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Phone className="h-3 w-3" />
                            {pedido.telefone || "-"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Entrega */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-sm font-medium text-slate-700">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(pedido.data_entrega)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="h-3 w-3" />
                            {pedido.cidade || "-"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Produto */}
                      <TableCell>
                        <span className="text-sm font-medium text-slate-700">
                          {pedido.produto}
                        </span>
                      </TableCell>

                      {/* Valor */}
                      <TableCell className="text-right">
                        <span className="text-sm font-bold text-slate-800">
                          {formatCurrency(pedido.valor)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all hover:shadow-sm">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${st.color}`}
                              >
                                {st.icon}
                                {st.label}
                              </span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48 rounded-xl">
                            <DropdownMenuLabel className="text-xs font-bold text-slate-400">
                              Alterar status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {ALL_STATUSES.map((s) => {
                              const cfg = STATUS_CONFIG[s];
                              return (
                                <DropdownMenuItem
                                  key={s}
                                  disabled={pedido.status === s}
                                  className="rounded-lg text-sm font-medium"
                                  onClick={() =>
                                    handleStatusChange(pedido.id, s)
                                  }
                                >
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${cfg.color}`}
                                  >
                                    {cfg.icon}
                                    {cfg.label}
                                  </span>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* Acoes */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl">
                            <DropdownMenuItem
                              asChild
                              className="rounded-lg text-sm font-medium"
                            >
                              <Link href={`/pedidos/${pedido.id}`}>
                                <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              asChild
                              className="rounded-lg text-sm font-medium"
                            >
                              <Link href={`/pedidos/${pedido.id}/editar`}>
                                <Pencil className="mr-2 h-4 w-4 text-slate-500" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="rounded-lg text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-600"
                              onClick={() => openDeleteDialog(pedido.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ---- Pagination ---- */}
      {!loading && total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Mostrando{" "}
            <span className="font-bold text-slate-700">
              {startItem}-{endItem}
            </span>{" "}
            de{" "}
            <span className="font-bold text-slate-700">{total}</span>
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className={`h-9 w-9 rounded-xl text-sm font-semibold ${
                  p === page
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ---- Delete Dialog ---- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="pt-2 text-center text-lg font-bold">
              Excluir pedido
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              Tem certeza que deseja excluir este pedido? Esta acao nao pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 font-semibold"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl font-semibold"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
