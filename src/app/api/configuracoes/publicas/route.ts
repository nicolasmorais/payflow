import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PUBLIC_KEYS = [
  "empresa_nome",
  "empresa_logo",
  "dias_entrega",
  "horarios_disponiveis",
  "prazo_minimo_agendamento",
  "mensagem_confirmacao",
  "pixel_taboola",
  "pixel_meta",
  "pixel_google_analytics",
  "pixel_google_ads",
  "favicon",
];

export async function GET() {
  try {
    const configuracoes = await prisma.configuracao.findMany({
      where: {
        chave: {
          in: PUBLIC_KEYS,
        },
      },
    });

    const keyValuePairs: Record<string, string> = {};
    for (const config of configuracoes) {
      keyValuePairs[config.chave] = config.valor;
    }

    return NextResponse.json({ success: true, data: keyValuePairs });
  } catch (error) {
    console.error("Erro ao buscar configurações públicas:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
