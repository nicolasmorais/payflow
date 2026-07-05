import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "excel";
    const status = searchParams.get("status") || undefined;
    const cidade = searchParams.get("cidade") || undefined;
    const produto = searchParams.get("produto") || undefined;
    const dataInicio = searchParams.get("data_inicio") || undefined;
    const dataFim = searchParams.get("data_fim") || undefined;

    const where: Prisma.PedidoWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (cidade) {
      where.cidade = { contains: cidade };
    }

    if (produto) {
      where.produto = { contains: produto };
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

    const pedidos = await prisma.pedido.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const statusLabels: Record<string, string> = {
      pendente: "Pendente",
      confirmado: "Confirmado",
      em_preparacao: "Em Preparação",
      saiu_entrega: "Saiu para Entrega",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };

    const exportData = pedidos.map((pedido) => ({
      "Nº Pedido": pedido.numero,
      Nome: pedido.nome,
      Telefone: pedido.telefone,
      CPF: pedido.cpf || "",
      CEP: pedido.cep,
      Rua: pedido.rua,
      Número: pedido.numero_endereco,
      Complemento: pedido.complemento || "",
      Bairro: pedido.bairro,
      Cidade: pedido.cidade,
      Estado: pedido.estado,
      Produto: pedido.produto,
      Quantidade: pedido.quantidade,
      Valor: Number(pedido.valor),
      "Data de Entrega": new Date(pedido.data_entrega).toLocaleDateString("pt-BR"),
      Horário: pedido.horario,
      Observações: pedido.observacoes || "",
      Status: statusLabels[pedido.status] || pedido.status,
      "Data do Pedido": new Date(pedido.created_at).toLocaleDateString("pt-BR"),
    }));

    if (format === "csv") {
      if (exportData.length === 0) {
        return new NextResponse("Nenhum dado para exportar", {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="pedidos.csv"',
          },
        });
      }

      const headers = Object.keys(exportData[0]);
      const csvRows = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = (row as any)[header] ?? "";
              const stringValue = String(value);
              if (
                stringValue.includes(",") ||
                stringValue.includes("\n") ||
                stringValue.includes('"')
              ) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(",")
        ),
      ];

      const csvContent = "\uFEFF" + csvRows.join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="pedidos.csv"',
        },
      });
    }

    // Excel format
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map((row) => String((row as any)[key] ?? "").length)
      );
      return { wch: maxLength + 2 };
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="pedidos.xlsx"',
      },
    });
  } catch (error) {
    console.error("Erro ao exportar pedidos:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
