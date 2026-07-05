"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, Clock, User, Package, Loader2 } from "lucide-react";
import { PixelScripts } from "@/components/pixels/pixel-scripts";
import { formatDate } from "@/lib/utils";

interface Pedido {
  id: string;
  numero: number;
  nome: string;
  produto: string;
  quantidade: number;
  valor: number | string;
  data_entrega: string;
  horario: string;
  status: string;
}

export default function ConfirmacaoPage() {
  const searchParams = useSearchParams();
  const pedidoNumero = searchParams.get("pedido");

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!pedidoNumero) {
      setLoading(false);
      return;
    }

    async function fetchPedido() {
      try {
        const res = await fetch(`/api/pedidos/numero/${pedidoNumero}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setPedido(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchPedido();
  }, [pedidoNumero]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Green Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-10 text-center">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Pedido Confirmado com Sucesso!
            </h1>
            {pedido && (
              <p className="mt-2 text-green-100 text-lg">
                Pedido #{pedido.numero}
              </p>
            )}
          </div>

          {/* Order Details */}
          <div className="px-8 py-8">
            {pedido ? (
              <div className="space-y-5">
                {/* Customer Name */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      Cliente
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {pedido.nome}
                    </p>
                  </div>
                </div>

                {/* Product */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      Produto
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {pedido.produto} (x{pedido.quantidade})
                    </p>
                  </div>
                </div>

                {/* Delivery Date */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      Data de Entrega
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(pedido.data_entrega)}
                    </p>
                  </div>
                </div>

                {/* Delivery Time */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      Horario de Entrega
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {pedido.horario}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Pedido Recebido!
                </h2>
                <p className="text-gray-600">
                  Seu pedido foi registrado com sucesso.
                </p>
              </div>
            )}

            {/* Contact Message */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-800 text-center leading-relaxed">
                Nossa equipe entrara em contato para confirmar os detalhes da
                entrega.
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-700 text-center">
                  Nao foi possivel carregar os detalhes do pedido, mas ele foi
                  registrado com sucesso.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Branding Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          PagFlow - Agendamento de Entregas
        </p>
      </div>

      <PixelScripts />
    </div>
  );
}
