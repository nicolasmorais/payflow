import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  try {
    const { numero } = await params;
    const numeroInt = parseInt(numero, 10);

    if (isNaN(numeroInt)) {
      return NextResponse.json(
        { error: "Numero de pedido invalido" },
        { status: 400 }
      );
    }

    const pedido = await prisma.pedido.findUnique({
      where: { numero: numeroInt },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido nao encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido por numero:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
