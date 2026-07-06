"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Package,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ProdutoForm } from "@/components/admin/produto-form";

interface Produto {
  id: string;
  nome: string;
  imagem_url: string | null;
  preco: number;
  checkout_link: string | null;
  checkout_id: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

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

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("all");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editProduto, setEditProduto] = useState<Produto | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getFullUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `${window.location.origin}${path}`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      const fullUrl = getFullUrl(text);
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      toast.success("Link copiado!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filtroAtivo !== "all") params.set("ativo", filtroAtivo);

      const res = await fetch(`/api/produtos?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao buscar produtos");
      const json = await res.json();

      setProdutos(json.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [search, filtroAtivo]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {}, 300);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/produtos/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir produto");
      toast.success("Produto excluido com sucesso!");
      setDeleteOpen(false);
      setDeleteId(null);
      fetchProdutos();
    } catch {
      toast.error("Erro ao excluir produto");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleAtivo = async (produto: Produto) => {
    try {
      const res = await fetch(`/api/produtos/${produto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !produto.ativo }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar produto");
      toast.success(
        produto.ativo
          ? "Produto desativado com sucesso!"
          : "Produto ativado com sucesso!"
      );
      fetchProdutos();
    } catch {
      toast.error("Erro ao atualizar produto");
    }
  };

  const openCreateForm = () => {
    setEditProduto(null);
    setFormOpen(true);
  };

  const openEditForm = (produto: Produto) => {
    setEditProduto(produto);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setSaving(true);
    try {
      const url = editProduto
        ? `/api/produtos/${editProduto.id}`
        : "/api/produtos";
      const method = editProduto ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar produto");
      }

      toast.success(
        editProduto
          ? "Produto atualizado com sucesso!"
          : "Produto cadastrado com sucesso!"
      );
      setFormOpen(false);
      setEditProduto(null);
      fetchProdutos();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const SkeletonRows = () => (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 7 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full bg-slate-100" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Produtos
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Gerencie os produtos do checkout
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={openCreateForm}
          className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm rounded-xl"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Novo Produto
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou ID do checkout..."
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={filtroAtivo} onValueChange={setFiltroAtivo}>
          <SelectTrigger className="w-[160px] h-11 bg-white border-slate-200 rounded-xl text-sm font-medium">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Ativos</SelectItem>
            <SelectItem value="false">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {produtos.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Ativos
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {produtos.filter((p) => p.ativo).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Inativos
          </p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {produtos.filter((p) => !p.ativo).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Maior Preco
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {produtos.length > 0
              ? formatCurrency(Math.max(...produtos.map((p) => p.preco)))
              : "-"}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-3.5">
                Produto
              </TableHead>
              <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-3.5">
                Preco
              </TableHead>
              <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-3.5">
                Checkout ID
              </TableHead>
              <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-3.5">
                Link Checkout
              </TableHead>
              <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-3.5">
                Status
              </TableHead>
              <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-3.5">
                Criacao
              </TableHead>
              <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wider py-3.5 text-right">
                Acoes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonRows />
            ) : produtos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Package className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-600">
                        Nenhum produto encontrado
                      </p>
                      <p className="text-sm text-slate-400 mt-0.5">
                        Cadastre seu primeiro produto clicando no botao acima
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              produtos.map((produto) => (
                <TableRow
                  key={produto.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {produto.imagem_url ? (
                        <img
                          src={produto.imagem_url}
                          alt={produto.nome}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                      <span className="font-semibold text-slate-800 text-sm">
                        {produto.nome}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-800 text-sm">
                    {formatCurrency(produto.preco)}
                  </TableCell>
                  <TableCell>
                    {produto.checkout_id ? (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded-md font-mono text-slate-600">
                          {produto.checkout_id}
                        </code>
                        {produto.checkout_link && (
                          <button
                            onClick={() => copyToClipboard(produto.checkout_link!, produto.id)}
                            className="p-1 rounded-md hover:bg-blue-50 transition-colors group"
                            title="Copiar link do checkout"
                          >
                            {copiedId === produto.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500" />
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {produto.checkout_link ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={getFullUrl(produto.checkout_link!)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[180px]"
                          title={produto.checkout_link}
                        >
                          /checkout/{produto.id.slice(0, 8)}...
                        </a>
                        <button
                          onClick={() => copyToClipboard(produto.checkout_link!, produto.id + "-link")}
                          className="p-1 rounded-md hover:bg-blue-50 transition-colors group"
                          title="Copiar link do checkout"
                        >
                          {copiedId === produto.id + "-link" ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`border font-semibold text-xs px-2.5 py-0.5 rounded-full ${
                        produto.ativo
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}
                      variant="outline"
                    >
                      {produto.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {formatDate(produto.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-slate-100"
                        >
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl">
                        <DropdownMenuLabel className="font-bold text-slate-700">
                          Acoes
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditForm(produto)}>
                          <Pencil className="h-4 w-4 mr-2 text-slate-500" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleAtivo(produto)}>
                          {produto.ativo ? (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-2 text-orange-500" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4 mr-2 text-emerald-500" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        {produto.checkout_link && (
                          <>
                            <DropdownMenuItem asChild>
                              <a
                                href={getFullUrl(produto.checkout_link!)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
                                Abrir Checkout
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyToClipboard(produto.checkout_link!, produto.id)}
                            >
                              {copiedId === produto.id ? (
                                <Check className="h-4 w-4 mr-2 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4 mr-2 text-slate-500" />
                              )}
                              Copiar Link
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => openDeleteDialog(produto.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Confirmar exclusao
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Tem certeza que deseja excluir este produto? Esta acao nao pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-lg border-slate-200"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-lg"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editProduto ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editProduto
                ? "Atualize as informacoes do produto"
                : "Preencha os dados para cadastrar um novo produto"}
            </DialogDescription>
          </DialogHeader>
          <ProdutoForm
            initialData={editProduto || undefined}
            onSubmit={handleFormSubmit}
            isLoading={saving}
            isEdit={!!editProduto}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
