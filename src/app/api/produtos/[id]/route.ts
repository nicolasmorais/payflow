import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return NextResponse.json(
        { success: false, error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: produto });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
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

    const existingProduto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!existingProduto) {
      return NextResponse.json(
        { success: false, error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    const { nome, imagem_url, preco, checkout_link, checkout_id, ativo } = body;

    if (nome !== undefined && (typeof nome !== "string" || nome.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: "Nome do produto não pode ser vazio" },
        { status: 400 }
      );
    }

    if (preco !== undefined && (isNaN(Number(preco)) || Number(preco) <= 0)) {
      return NextResponse.json(
        { success: false, error: "Preço deve ser um valor positivo" },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome: nome.trim() }),
        ...(imagem_url !== undefined && { imagem_url: imagem_url?.trim() || null }),
        ...(preco !== undefined && { preco: Number(preco) }),
        ...(checkout_link !== undefined && { checkout_link: checkout_link?.trim() || null }),
        ...(checkout_id !== undefined && { checkout_id: checkout_id?.trim() || null }),
        ...(ativo !== undefined && { ativo: Boolean(ativo) }),
      },
    });

    return NextResponse.json({ success: true, data: produto });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existingProduto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!existingProduto) {
      return NextResponse.json(
        { success: false, error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    await prisma.produto.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Produto excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
