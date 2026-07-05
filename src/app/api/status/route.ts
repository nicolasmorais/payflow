import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const startTime = Date.now();

  // Always collect system info regardless of DB status
  const systemInfo = {
    uptime: process.uptime(),
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
    platform: process.platform,
  };

  // Try database operations independently
  let dbStatus: "connected" | "disconnected" = "disconnected";
  let dbLatency: number | undefined;
  let dbVersion = "N/A";
  let dbSize = "N/A";
  let dbError: string | undefined;
  let tables = { pedidos: 0, users: 0, configuracoes: 0, historico_pedidos: 0 };
  let latestPedido: string | null = null;

  try {
    // Test basic connection
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Falha na conexão com o banco de dados";
  }

  // Only try additional queries if connected
  if (dbStatus === "connected") {
    // Get table counts independently
    const countResults = await Promise.allSettled([
      prisma.pedido.count(),
      prisma.user.count(),
      prisma.configuracao.count(),
      prisma.historicoPedido.count(),
    ]);

    if (countResults[0].status === "fulfilled") tables.pedidos = countResults[0].value;
    if (countResults[1].status === "fulfilled") tables.users = countResults[1].value;
    if (countResults[2].status === "fulfilled") tables.configuracoes = countResults[2].value;
    if (countResults[3].status === "fulfilled") tables.historico_pedidos = countResults[3].value;

    // Get latest pedido
    try {
      const result = await prisma.pedido.findFirst({
        orderBy: { created_at: "desc" },
        select: { created_at: true },
      });
      latestPedido = result?.created_at?.toISOString() || null;
    } catch {
      // Non-critical, skip
    }

    // Get PostgreSQL-specific info (best effort)
    try {
      const result = (await prisma.$queryRaw`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `) as { size: string }[];
      if (result.length > 0) dbSize = result[0].size;
    } catch {
      // Not PostgreSQL or permission denied
    }

    try {
      const result = (await prisma.$queryRaw`
        SELECT version() as version
      `) as { version: string }[];
      if (result.length > 0) {
        dbVersion = result[0].version.split(" ")[1] || result[0].version;
      }
    } catch {
      // Non-critical
    }
  }

  const totalLatency = Date.now() - startTime;

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      success: isHealthy,
      data: {
        status: isHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        ...systemInfo,
        database: {
          status: dbStatus,
          latency: dbLatency,
          version: dbVersion,
          size: dbSize,
          tables,
          latestPedido,
          ...(dbError ? { error: dbError } : {}),
        },
        performance: {
          totalLatency,
        },
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
