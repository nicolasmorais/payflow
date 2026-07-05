import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date();
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Run all queries in parallel
    const [
      totalPedidos,
      pedidosHoje,
      entregasHoje,
      entregasAmanha,
      pedidosConcluidos,
      pedidosCancelados,
      pedidosPorStatus,
    ] = await Promise.all([
      prisma.pedido.count(),
      prisma.pedido.count({
        where: {
          created_at: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      prisma.pedido.count({
        where: {
          data_entrega: {
            gte: todayStart,
            lte: todayEnd,
          },
          status: { not: "cancelado" },
        },
      }),
      prisma.pedido.count({
        where: {
          data_entrega: {
            gte: tomorrowStart,
            lte: tomorrowEnd,
          },
          status: { not: "cancelado" },
        },
      }),
      prisma.pedido.count({
        where: { status: "entregue" },
      }),
      prisma.pedido.count({
        where: { status: "cancelado" },
      }),
      prisma.pedido.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // Pedidos por dia (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const pedidosLast30Days = await prisma.pedido.findMany({
      where: {
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        created_at: true,
      },
    });

    const pedidosPorDiaMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      pedidosPorDiaMap[key] = 0;
    }
    for (const pedido of pedidosLast30Days) {
      const key = pedido.created_at.toISOString().split("T")[0];
      if (pedidosPorDiaMap[key] !== undefined) {
        pedidosPorDiaMap[key]++;
      }
    }
    const pedidosPorDia = Object.entries(pedidosPorDiaMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Pedidos por cidade (top 10)
    const pedidosPorCidadeRaw = await prisma.pedido.groupBy({
      by: ["cidade"],
      _count: { id: true },
      orderBy: {
        _count: { id: "desc" },
      },
      take: 10,
    });
    const pedidosPorCidade = pedidosPorCidadeRaw.map((item) => ({
      cidade: item.cidade,
      count: item._count.id,
    }));

    // Evolucao mensal (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const pedidosLast12Months = await prisma.pedido.findMany({
      where: {
        created_at: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        created_at: true,
        valor: true,
      },
    });

    const evolucaoMensalMap: Record<string, { total: number; receita: number }> = {};
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      evolucaoMensalMap[key] = { total: 0, receita: 0 };
    }
    for (const pedido of pedidosLast12Months) {
      const key = `${pedido.created_at.getFullYear()}-${String(pedido.created_at.getMonth() + 1).padStart(2, "0")}`;
      if (evolucaoMensalMap[key]) {
        evolucaoMensalMap[key].total++;
        evolucaoMensalMap[key].receita += Number(pedido.valor);
      }
    }
    const evolucaoMensal = Object.entries(evolucaoMensalMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Format pedidos por status
    const statusLabels: Record<string, string> = {
      pendente: "Pendente",
      confirmado: "Confirmado",
      em_preparacao: "Em Preparação",
      saiu_entrega: "Saiu para Entrega",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };

    const pedidosPorStatusData = pedidosPorStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalPedidos,
        pedidosHoje,
        entregasHoje,
        entregasAmanha,
        pedidosConcluidos,
        pedidosCancelados,
        pedidosPorDia,
        pedidosPorCidade,
        evolucaoMensal,
        pedidosPorStatus: pedidosPorStatusData,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
