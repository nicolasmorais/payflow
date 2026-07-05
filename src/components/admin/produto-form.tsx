"use client";

import { useState } from "react";
import { Loader2, Upload, X, Package, DollarSign, Hash } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ProdutoFormProps {
  initialData?: {
    id?: string;
    nome?: string;
    imagem_url?: string | null;
    preco?: number;
    checkout_id?: string | null;
    ativo?: boolean;
  };
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
}

export function ProdutoForm({
  initialData,
  onSubmit,
  isLoading,
  isEdit = false,
}: ProdutoFormProps) {
  const [nome, setNome] = useState(initialData?.nome || "");
  const [imagemUrl, setImagemUrl] = useState(initialData?.imagem_url || "");
  const [preco, setPreco] = useState(
    initialData?.preco ? String(initialData.preco) : ""
  );
  const [checkoutId, setCheckoutId] = useState(
    initialData?.checkout_id || ""
  );
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) {
      newErrors.nome = "Nome do produto e obrigatorio";
    }

    if (!preco || isNaN(Number(preco)) || Number(preco) <= 0) {
      newErrors.preco = "Preco deve ser um valor positivo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      nome: nome.trim(),
      imagem_url: imagemUrl.trim() || null,
      preco: Number(preco),
      checkout_id: checkoutId.trim() || null,
      ativo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informacoes basicas */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Package className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg">Informacoes do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="nome">Nome do Produto *</Label>
              <Input
                id="nome"
                placeholder="Ex: Kit Churrasco Premium"
                className="mt-1.5"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              {errors.nome && (
                <p className="mt-1 text-xs text-red-500">{errors.nome}</p>
              )}
            </div>
            <div>
              <Label htmlFor="preco">Preco (R$) *</Label>
              <div className="relative mt-1.5">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-9"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                />
              </div>
              {errors.preco && (
                <p className="mt-1 text-xs text-red-500">{errors.preco}</p>
              )}
            </div>
            <div>
              <Label htmlFor="checkout_id">ID do Checkout</Label>
              <div className="relative mt-1.5">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="checkout_id"
                  placeholder="ID do produto no gateway"
                  className="pl-9"
                  value={checkoutId}
                  onChange={(e) => setCheckoutId(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 w-full">
                <Switch
                  checked={ativo}
                  onCheckedChange={setAtivo}
                  id="ativo"
                />
                <div>
                  <Label htmlFor="ativo" className="cursor-pointer font-semibold text-sm">
                    {ativo ? "Ativo" : "Inativo"}
                  </Label>
                  <p className="text-xs text-slate-500">
                    {ativo
                      ? "Produto visivel no checkout"
                      : "Produto oculto no checkout"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imagem */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <Upload className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg">Imagem do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="imagem_url">URL da Imagem</Label>
            <Input
              id="imagem_url"
              placeholder="https://exemplo.com/imagem.jpg"
              className="mt-1.5"
              value={imagemUrl}
              onChange={(e) => setImagemUrl(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Cole a URL de uma imagem do produto
            </p>
          </div>
          {imagemUrl && (
            <div className="mt-4 relative inline-block">
              <img
                src={imagemUrl}
                alt="Preview"
                className="h-32 w-32 rounded-xl object-cover border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setImagemUrl("")}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Salvar Alteracoes" : "Cadastrar Produto"}
        </Button>
      </div>
    </form>
  );
}
