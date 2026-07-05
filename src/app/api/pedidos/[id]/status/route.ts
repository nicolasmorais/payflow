import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { statusSchema } from "@/lib/validations/pedido";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status: newStatus } = statusSchema.parse(body);

    const pedido = await prisma.pedido.findUnique({
      where: { id },
    });

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    const statusLabels: Record<string, string> = {
      pendente: "Pendente",
      confirmado: "Confirmado",
      em_preparacao: "Em Preparação",
      saiu_entrega: "Saiu para Entrega",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };

    const oldStatusLabel = statusLabels[pedido.status] || pedido.status;
    const newStatusLabel = statusLabels[newStatus] || newStatus;

    const updatedPedido = await prisma.pedido.update({
      where: { id },
      data: { status: newStatus },
    });

    await prisma.historicoPedido.create({
      data: {
        pedido_id: id,
        usuario: "Admin",
        alteracao: `Status alterado de ${oldStatusLabel} para ${newStatusLabel}`,
      },
    });

    return NextResponse.json({ success: true, data: updatedPedido });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Status inválido", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
