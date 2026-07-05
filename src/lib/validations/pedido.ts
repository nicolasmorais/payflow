import { z } from "zod";

export const createPedidoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  cpf: z.string().optional().default(""),
  cep: z.string().min(1, "CEP é obrigatório"),
  rua: z.string().min(1, "Rua é obrigatória"),
  numero_endereco: z.string().min(1, "Número do endereço é obrigatório"),
  complemento: z.string().optional().default(""),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório"),
  produto: z.string().min(1, "Produto é obrigatório"),
  quantidade: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1"),
  valor: z.coerce.number().min(0, "Valor deve ser positivo"),
  data_entrega: z.string().min(1, "Data de entrega é obrigatória"),
  horario: z.string().min(1, "Horário é obrigatório"),
  observacoes: z.string().nullable().optional(),
  utm_source: z.string().nullable().optional(),
  utm_medium: z.string().nullable().optional(),
  utm_campaign: z.string().nullable().optional(),
  utm_content: z.string().nullable().optional(),
  utm_term: z.string().nullable().optional(),
  referer: z.string().nullable().optional(),
});

export const updatePedidoSchema = createPedidoSchema.extend({
  status: z
    .enum([
      "pendente",
      "confirmado",
      "em_preparacao",
      "saiu_entrega",
      "entregue",
      "cancelado",
    ])
    .optional(),
});

export const statusSchema = z.object({
  status: z.enum([
    "pendente",
    "confirmado",
    "em_preparacao",
    "saiu_entrega",
    "entregue",
    "cancelado",
  ]),
});

export type CreatePedidoInput = z.infer<typeof createPedidoSchema>;
export type UpdatePedidoInput = z.infer<typeof updatePedidoSchema>;
export type StatusInput = z.infer<typeof statusSchema>;
