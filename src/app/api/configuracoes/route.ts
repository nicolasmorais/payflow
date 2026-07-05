import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  try {
    const configuracoes = await prisma.configuracao.findMany({
      orderBy: { chave: "asc" },
    });

    const keyValuePairs: Record<string, string> = {};
    for (const config of configuracoes) {
      keyValuePairs[config.chave] = config.valor;
    }

    return NextResponse.json({ success: true, data: keyValuePairs });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

const updateConfigSchema = z.array(
  z.object({
    chave: z.string().min(1),
    valor: z.string(),
  })
);

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateConfigSchema.parse(body);

    const results = await Promise.all(
      validatedData.map((item) =>
        prisma.configuracao.upsert({
          where: { chave: item.chave },
          update: { valor: item.valor },
          create: { chave: item.chave, valor: item.valor },
        })
      )
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar configurações:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
