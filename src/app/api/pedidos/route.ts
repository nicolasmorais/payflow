import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPedidoSchema } from "@/lib/validations/pedido";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPedidoSchema.parse(body);

    // Generate sequential number
    const lastPedido = await prisma.pedido.findFirst({
      orderBy: { numero: "desc" },
      select: { numero: true },
    });
    const nextNumero = (lastPedido?.numero ?? 0) + 1;

    const pedido = await prisma.pedido.create({
      data: {
        ...validatedData,
        numero: nextNumero,
        data_entrega: new Date(validatedData.data_entrega),
        valor: validatedData.valor,
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        user_agent: request.headers.get("user-agent") || null,
      },
    });

    await prisma.historicoPedido.create({
      data: {
        pedido_id: pedido.id,
        usuario: "Sistema",
        alteracao: "Pedido criado",
      },
    });

    return NextResponse.json(
      { success: true, data: pedido },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const cidade = searchParams.get("cidade") || undefined;
    const produto = searchParams.get("produto") || undefined;
    const dataInicio = searchParams.get("data_inicio") || undefined;
    const dataFim = searchParams.get("data_fim") || undefined;
    const hoje = searchParams.get("hoje") === "true";
    const amanha = searchParams.get("amanha") === "true";

    const skip = (page - 1) * limit;

    const where: Prisma.PedidoWhereInput = {};

    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { nome: { contains: searchLower } },
        { telefone: { contains: search } },
        { cpf: { contains: search } },
        { cidade: { contains: searchLower } },
        { produto: { contains: searchLower } },
        { numero: { equals: isNaN(Number(search)) ? undefined : Number(search) } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (cidade) {
      where.cidade = { contains: cidade.toLowerCase() };
    }

    if (produto) {
      where.produto = { contains: produto.toLowerCase() };
    }

    if (dataInicio || dataFim) {
      where.data_entrega = {};
      if (dataInicio) {
        where.data_entrega.gte = new Date(dataInicio);
      }
      if (dataFim) {
        where.data_entrega.lte = new Date(dataFim + "T23:59:59.999Z");
      }
    }

    if (hoje) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      where.data_entrega = {
        gte: todayStart,
        lte: todayEnd,
      };
    }

    if (amanha) {
      const tomorrowStart = new Date();
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);
      const tomorrowEnd = new Date();
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
      tomorrowEnd.setHours(23, 59, 59, 999);
      where.data_entrega = {
        gte: tomorrowStart,
        lte: tomorrowEnd,
      };
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.pedido.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: pedidos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
