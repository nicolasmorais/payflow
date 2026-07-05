import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as BRL currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format a CPF string (e.g., 12345678901 -> 123.456.789-01)
 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Format a phone number (e.g., 11999998888 -> (11) 99999-8888)
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

/**
 * Format a date as dd/MM/yyyy
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Status constants mapping status keys to labels and colors
 */
export const STATUS: Record<
  string,
  { label: string; color: string }
> = {
  pendente: {
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800",
  },
  confirmado: {
    label: "Confirmado",
    color: "bg-blue-100 text-blue-800",
  },
  em_preparacao: {
    label: "Em Preparação",
    color: "bg-purple-100 text-purple-800",
  },
  saiu_entrega: {
    label: "Saiu para Entrega",
    color: "bg-orange-100 text-orange-800",
  },
  entregue: {
    label: "Entregue",
    color: "bg-green-100 text-green-800",
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800",
  },
};

/**
 * Extract UTM parameters from the current URL
 * Returns an object with utm_source, utm_medium, utm_campaign, utm_content, utm_term
 */
export function getUTMParams(): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
} {
  if (typeof window === "undefined") {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
  };
}
