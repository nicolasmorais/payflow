import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const ativo = searchParams.get("ativo");

    const where: any = {};

    if (search) {
      where.OR = [
        { nome: { contains: search.toLowerCase() } },
        { checkout_id: { contains: search.toLowerCase() } },
      ];
    }

    if (ativo !== null && ativo !== undefined && ativo !== "all") {
      where.ativo = ativo === "true";
    }

    const produtos = await prisma.produto.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    // Normalizar checkout_links antigos que salvaram URL completa
    const normalized = produtos.map((p) => {
      if (p.checkout_link && p.checkout_link.includes("/checkout/")) {
        const match = p.checkout_link.match(/\/checkout\/.+/);
        if (match) return { ...p, checkout_link: match[0] };
      }
      return p;
    });

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { nome, imagem_url, preco, checkout_id } = body;

    if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Nome do produto é obrigatório" },
        { status: 400 }
      );
    }

    if (preco === undefined || preco === null || isNaN(Number(preco)) || Number(preco) <= 0) {
      return NextResponse.json(
        { success: false, error: "Preço deve ser um valor positivo" },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.create({
      data: {
        nome: nome.trim(),
        imagem_url: imagem_url?.trim() || null,
        preco: Number(preco),
        checkout_id: checkout_id?.trim() || null,
      },
    });

    // Salvar apenas o caminho, URL completa e gerada no frontend
    const checkoutLink = `/checkout/${produto.id}`;

    const produtoAtualizado = await prisma.produto.update({
      where: { id: produto.id },
      data: { checkout_link: checkoutLink },
    });

    return NextResponse.json(
      { success: true, data: produtoAtualizado },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
