import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const pedido = await prisma.pedido.findUnique({
      where: { id },
    });

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    const historico = await prisma.historicoPedido.findMany({
      where: { pedido_id: id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data: historico });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
