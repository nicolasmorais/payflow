import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import CheckoutClient from "./checkout-client";
import { PixelScripts } from "@/components/pixels/pixel-scripts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutProdutoPage({ params }: PageProps) {
  const { id } = await params;

  const produto = await prisma.produto.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      imagem_url: true,
      preco: true,
      ativo: true,
    },
  });

  if (!produto || !produto.ativo) {
    notFound();
  }

  return (
    <>
      <PixelScripts />
      <CheckoutClient produto={produto} />
    </>
  );
}
