"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  createPedidoSchema,
  updatePedidoSchema,
  type CreatePedidoInput,
  type UpdatePedidoInput,
} from "@/lib/validations/pedido";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { User, MapPin, Calendar, Package } from "lucide-react";

const ESTADOS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapa" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceara" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espirito Santo" },
  { value: "GO", label: "Goias" },
  { value: "MA", label: "Maranhao" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Para" },
  { value: "PB", label: "Paraiba" },
  { value: "PR", label: "Parana" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piaui" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondonia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "Sao Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const HORARIOS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "em_preparacao", label: "Em Preparacao" },
  { value: "saiu_entrega", label: "Saiu para Entrega" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

interface PedidoFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
}

export function PedidoForm({
  initialData,
  onSubmit,
  isLoading,
  isEdit = false,
}: PedidoFormProps) {
  const schema = isEdit ? updatePedidoSchema : createPedidoSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      nome: "",
      telefone: "",
      cpf: "",
      cep: "",
      rua: "",
      numero_endereco: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      produto: "",
      quantidade: 1,
      valor: 0,
      data_entrega: "",
      horario: "",
      observacoes: "",
    },
  });

  const estadoValue = watch("estado");
  const horarioValue = watch("horario");
  const statusValue = watch("status");

  // Auto-format phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length > 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    setValue("telefone", formatted);
  };

  // Auto-format CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    if (digits.length > 9) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    setValue("cpf", formatted);
  };

  const handleFormSubmit = async (data: any) => {
    const payload = {
      ...data,
      quantidade: Number(data.quantidade),
      valor:
        typeof data.valor === "string"
          ? parseFloat(data.valor)
          : Number(data.valor),
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Status - only in edit mode */}
      {isEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Label htmlFor="status">Status do Pedido</Label>
              <Select
                value={statusValue}
                onValueChange={(val) => setValue("status", val)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.status.message as string}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados do Cliente */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <User className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                placeholder="Nome completo"
                className="mt-1.5"
                {...register("nome")}
              />
              {errors.nome && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.nome.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                placeholder="(00) 00000-0000"
                className="mt-1.5"
                {...register("telefone")}
                onChange={handlePhoneChange}
              />
              {errors.telefone && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.telefone.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                className="mt-1.5"
                {...register("cpf")}
                onChange={handleCpfChange}
              />
              {errors.cpf && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.cpf.message as string}
                </p>
              )}
            </div>
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
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                placeholder="00000-000"
                className="mt-1.5"
                {...register("cep")}
              />
              {errors.cep && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.cep.message as string}
                </p>
              )}
            </div>
            <div className="hidden sm:block" />
            <div className="sm:col-span-2">
              <Label htmlFor="rua">Rua *</Label>
              <Input
                id="rua"
                placeholder="Nome da rua"
                className="mt-1.5"
                {...register("rua")}
              />
              {errors.rua && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.rua.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="numero_endereco">Numero *</Label>
              <Input
                id="numero_endereco"
                placeholder="123"
                className="mt-1.5"
                {...register("numero_endereco")}
              />
              {errors.numero_endereco && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.numero_endereco.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                placeholder="Apto, bloco, etc."
                className="mt-1.5"
                {...register("complemento")}
              />
            </div>
            <div>
              <Label htmlFor="bairro">Bairro *</Label>
              <Input
                id="bairro"
                placeholder="Bairro"
                className="mt-1.5"
                {...register("bairro")}
              />
              {errors.bairro && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.bairro.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                placeholder="Cidade"
                className="mt-1.5"
                {...register("cidade")}
              />
              {errors.cidade && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.cidade.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={estadoValue}
                onValueChange={(val) => setValue("estado", val)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((est) => (
                    <SelectItem key={est.value} value={est.value}>
                      {est.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.estado && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.estado.message as string}
                </p>
              )}
            </div>
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
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="data_entrega">Data de Entrega *</Label>
              <Input
                id="data_entrega"
                type="date"
                className="mt-1.5"
                {...register("data_entrega")}
              />
              {errors.data_entrega && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.data_entrega.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="horario">Horario *</Label>
              <Select
                value={horarioValue}
                onValueChange={(val) => setValue("horario", val)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione o horario" />
                </SelectTrigger>
                <SelectContent>
                  {HORARIOS.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.horario && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.horario.message as string}
                </p>
              )}
            </div>
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
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <Label htmlFor="produto">Nome do Produto *</Label>
              <Input
                id="produto"
                placeholder="Ex: Kit Churrasco Premium"
                className="mt-1.5"
                {...register("produto")}
              />
              {errors.produto && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.produto.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                className="mt-1.5"
                {...register("quantidade", { valueAsNumber: true })}
              />
              {errors.quantidade && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.quantidade.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="mt-1.5"
                {...register("valor", { valueAsNumber: true })}
              />
              {errors.valor && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.valor.message as string}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observacoes */}
      <Card>
        <CardContent className="pt-6">
          <div>
            <Label htmlFor="observacoes">Observacoes</Label>
            <textarea
              id="observacoes"
              rows={4}
              placeholder="Informacao adicional sobre o pedido ou entrega..."
              className="mt-1.5 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("observacoes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link href="/pedidos">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Salvar Alteracoes" : "Criar Pedido"}
        </Button>
      </div>
    </form>
  );
}
