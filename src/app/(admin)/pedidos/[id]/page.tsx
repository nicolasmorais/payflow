"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Package,
  Share2,
  Clock,
  Edit,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  formatDate,
  formatCurrency,
  formatCPF,
  formatPhone,
  STATUS,
} from "@/lib/utils";

interface Pedido {
  id: string;
  numero: number;
  nome: string;
  telefone: string;
  cpf: string | null;
  cep: string;
  rua: string;
  numero_endereco: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  produto: string;
  quantidade: number;
  valor: number | string;
  data_entrega: string;
  horario: string;
  status: string;
  observacoes: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referer: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

interface Historico {
  id: string;
  pedido_id: string;
  usuario: string;
  alteracao: string;
  created_at: string;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PedidoDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    async function fetchPedido() {
      try {
        const response = await fetch(`/api/pedidos/${id}`);
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) throw new Error("Erro ao buscar pedido");
        const result = await response.json();
        setPedido(result.data);

        // Fetch historico
        const histResponse = await fetch(`/api/pedidos/${id}/historico`);
        if (histResponse.ok) {
          const histResult = await histResponse.json();
          setHistorico(histResult.data || []);
        }
      } catch (err) {
        toast.error("Erro ao carregar pedido");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPedido();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setStatusChanging(true);
    try {
      const response = await fetch(`/api/pedidos/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar status");

      const result = await response.json();
      setPedido(result.data);
      toast.success("Status atualizado com sucesso");

      // Refresh historico
      const histResponse = await fetch(`/api/pedidos/${id}/historico`);
      if (histResponse.ok) {
        const histResult = await histResponse.json();
        setHistorico(histResult.data || []);
      }
    } catch (err) {
      toast.error("Erro ao atualizar status");
      console.error(err);
    } finally {
      setStatusChanging(false);
    }
  };

  const formatValor = (valor: number | string): string => {
    const num = typeof valor === "string" ? parseFloat(valor) : valor;
    return formatCurrency(num);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (notFound || !pedido) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-gray-900">
            Pedido nao encontrado
          </h2>
          <p className="mt-2 text-gray-500">
            O pedido que voce procura nao existe ou foi removido.
          </p>
          <Link href="/pedidos">
            <Button className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Pedidos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS[pedido.status] || {
    label: pedido.status,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pedidos">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pedido #{pedido.numero}
            </h1>
            <p className="text-sm text-gray-500">
              Criado em {formatDate(pedido.created_at)}
            </p>
          </div>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Alterar status:</span>
            <Select
              value={pedido.status}
              onValueChange={handleStatusChange}
              disabled={statusChanging}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="em_preparacao">Em Preparacao</SelectItem>
                <SelectItem value="saiu_entrega">Saiu para Entrega</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href={`/pedidos/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <Separator />

      {/* Card Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Dados do Cliente */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <User className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="font-medium">{pedido.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefone</p>
              <p className="font-medium">{formatPhone(pedido.telefone)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CPF</p>
              <p className="font-medium">
                {pedido.cpf ? formatCPF(pedido.cpf) : "Nao informado"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endereco */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <MapPin className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">Endereco</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">CEP</p>
              <p className="font-medium">{pedido.cep}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Endereco</p>
              <p className="font-medium">
                {pedido.rua}, {pedido.numero_endereco}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Complemento</p>
              <p className="font-medium">{pedido.complemento || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bairro</p>
              <p className="font-medium">{pedido.bairro}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cidade / Estado</p>
              <p className="font-medium">
                {pedido.cidade} - {pedido.estado}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Agendamento */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Calendar className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Data de Entrega</p>
              <p className="font-medium">
                {formatDate(pedido.data_entrega)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Horario</p>
              <p className="font-medium">{pedido.horario}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Produto */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <Package className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Produto</p>
              <p className="font-medium">{pedido.produto}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantidade</p>
              <p className="font-medium">{pedido.quantidade}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valor</p>
              <p className="text-lg font-bold text-green-600">
                {formatValor(pedido.valor)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marketing - Full Width */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
            <Share2 className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg">Marketing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">utm_source</p>
              <p className="font-medium">
                {pedido.utm_source || "Nao informado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">utm_medium</p>
              <p className="font-medium">
                {pedido.utm_medium || "Nao informado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">utm_campaign</p>
              <p className="font-medium">
                {pedido.utm_campaign || "Nao informado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">utm_content</p>
              <p className="font-medium">
                {pedido.utm_content || "Nao informado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">utm_term</p>
              <p className="font-medium">
                {pedido.utm_term || "Nao informado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Referer</p>
              <p className="font-medium">
                {pedido.referer || "Nao informado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IP</p>
              <p className="font-medium">
                {pedido.ip || "Nao informado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User Agent</p>
              <p className="max-w-xs truncate font-medium" title={pedido.user_agent || ""}>
                {pedido.user_agent || "Nao informado"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historico - Full Width */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <Clock className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg">Historico</CardTitle>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Nenhum historico registrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Alteracao</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historico.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell>{item.usuario}</TableCell>
                    <TableCell>{item.alteracao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
