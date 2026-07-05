import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updatePedidoSchema } from "@/lib/validations/pedido";
import { Prisma } from "@prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        historico: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: pedido });
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePedidoSchema.parse(body);

    const existingPedido = await prisma.pedido.findUnique({
      where: { id },
    });

    if (!existingPedido) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    const changes: string[] = [];

    const fieldLabels: Record<string, string> = {
      nome: "Nome",
      telefone: "Telefone",
      cpf: "CPF",
      cep: "CEP",
      rua: "Rua",
      numero_endereco: "Número do endereço",
      complemento: "Complemento",
      bairro: "Bairro",
      cidade: "Cidade",
      estado: "Estado",
      produto: "Produto",
      quantidade: "Quantidade",
      valor: "Valor",
      data_entrega: "Data de entrega",
      horario: "Horário",
      observacoes: "Observações",
      status: "Status",
    };

    for (const [key, newValue] of Object.entries(validatedData)) {
      if (newValue === undefined) continue;

      const oldValue = (existingPedido as any)[key];

      let normalizedOld = oldValue;
      let normalizedNew = newValue;

      if (key === "data_entrega" && oldValue instanceof Date) {
        normalizedOld = oldValue.toISOString();
        normalizedNew = new Date(newValue as string).toISOString();
      }

      if (key === "valor" && oldValue !== null && oldValue !== undefined) {
        normalizedOld = Number(oldValue);
        normalizedNew = Number(newValue);
      }

      if (String(normalizedOld) !== String(normalizedNew)) {
        const label = fieldLabels[key] || key;
        changes.push(`${label}: "${oldValue}" -> "${newValue}"`);
      }
    }

    const updatedPedido = await prisma.pedido.update({
      where: { id },
      data: {
        ...validatedData,
        data_entrega: validatedData.data_entrega
          ? new Date(validatedData.data_entrega)
          : undefined,
        valor: validatedData.valor !== undefined
          ? validatedData.valor
          : undefined,
      },
    });

    if (changes.length > 0) {
      await prisma.historicoPedido.create({
        data: {
          pedido_id: id,
          usuario: "Admin",
          alteracao: changes.join("; "),
        },
      });
    }

    return NextResponse.json({ success: true, data: updatedPedido });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar pedido:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existingPedido = await prisma.pedido.findUnique({
      where: { id },
    });

    if (!existingPedido) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    await prisma.historicoPedido.deleteMany({
      where: { pedido_id: id },
    });

    await prisma.pedido.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Pedido excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir pedido:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
