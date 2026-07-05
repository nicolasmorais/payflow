"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Settings } from "lucide-react";
import { toast } from "sonner";

interface ConfigItem {
  id: string;
  chave: string;
  valor: string;
}

type ConfigMap = Record<string, string>;

const DEFAULT_CONFIG: ConfigMap = {
  empresa_nome: "",
  empresa_logo: "",
  favicon: "",
  dias_entrega: "",
  horarios_disponiveis: "",
  prazo_minimo_agendamento: "24",
  mensagem_confirmacao: "",
  pixel_taboola: "",
  pixel_meta: "",
  pixel_google_analytics: "",
  pixel_google_ads: "",
  tema: "system",
};

const TAB_SECTIONS: {
  key: string;
  label: string;
  fields: {
    key: string;
    label: string;
    description: string;
    type: "text" | "textarea" | "number" | "select";
    options?: { value: string; label: string }[];
    placeholder?: string;
  }[];
}[] = [
  {
    key: "geral",
    label: "Geral",
    fields: [
      {
        key: "empresa_nome",
        label: "Nome da Empresa",
        description: "Nome exibido no cabecalho e titulos do sistema",
        type: "text",
        placeholder: "Minha Empresa",
      },
      {
        key: "empresa_logo",
        label: "Logo da Empresa",
        description: "URL da imagem do logo exibido no sistema",
        type: "text",
        placeholder: "https://exemplo.com/logo.png",
      },
      {
        key: "favicon",
        label: "Favicon",
        description: "URL do icone exibido na aba do navegador",
        type: "text",
        placeholder: "https://exemplo.com/favicon.ico",
      },
    ],
  },
  {
    key: "entrega",
    label: "Entrega",
    fields: [
      {
        key: "dias_entrega",
        label: "Dias de Entrega",
        description:
          "Dias da semana disponiveis para entrega, separados por virgula (ex: segunda,terca,quarta,quinta,sexta)",
        type: "text",
        placeholder: "segunda,terca,quarta,quinta,sexta",
      },
      {
        key: "horarios_disponiveis",
        label: "Horarios Disponiveis",
        description:
          "Horarios disponiveis para entrega, separados por virgula (ex: 08:00,09:00,10:00,14:00,15:00)",
        type: "text",
        placeholder: "08:00,09:00,10:00,14:00,15:00",
      },
      {
        key: "prazo_minimo_agendamento",
        label: "Prazo Minimo de Agendamento (horas)",
        description:
          "Quantas horas de antecedencia o cliente precisa agendar a entrega",
        type: "number",
        placeholder: "24",
      },
    ],
  },
  {
    key: "mensagem",
    label: "Mensagem",
    fields: [
      {
        key: "mensagem_confirmacao",
        label: "Mensagem de Confirmacao",
        description:
          "Mensagem exibida ao cliente apos a confirmacao do pedido",
        type: "textarea",
        placeholder:
          "Obrigado pelo seu pedido! Nossa equipe entrara em contato em breve.",
      },
    ],
  },
  {
    key: "pixels",
    label: "Pixels",
    fields: [
      {
        key: "pixel_meta",
        label: "Meta Pixel ID",
        description:
          "ID do Pixel do Facebook/Meta para rastreamento de conversoes",
        type: "text",
        placeholder: "123456789012345",
      },
      {
        key: "pixel_google_analytics",
        label: "Google Analytics ID",
        description:
          "ID de medicao do Google Analytics (formato G-XXXXXXXXXX)",
        type: "text",
        placeholder: "G-XXXXXXXXXX",
      },
      {
        key: "pixel_google_ads",
        label: "Google Ads ID",
        description:
          "ID de conversao do Google Ads (formato AW-XXXXXXXXXX)",
        type: "text",
        placeholder: "AW-XXXXXXXXXX",
      },
      {
        key: "pixel_taboola",
        label: "Taboola Advertiser ID",
        description:
          "ID do anunciante no Taboola para rastreamento de conversoes",
        type: "text",
        placeholder: "123456",
      },
    ],
  },
  {
    key: "aparencia",
    label: "Aparencia",
    fields: [
      {
        key: "tema",
        label: "Tema do Sistema",
        description:
          "Define a aparencia do sistema: claro, escuro ou automatico (segue o sistema)",
        type: "select",
        options: [
          { value: "light", label: "Claro" },
          { value: "dark", label: "Escuro" },
          { value: "system", label: "Automatico (Sistema)" },
        ],
      },
    ],
  },
];

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfigMap>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/configuracoes");
        if (!res.ok) return;
        const json = await res.json();
        const data: Record<string, string> = json.data ?? json;

        const map: ConfigMap = { ...DEFAULT_CONFIG };
        Object.entries(data).forEach(([chave, valor]) => {
          map[chave] = valor as string;
        });
        setConfig(map);
      } catch (err) {
        console.error("Erro ao carregar configuracoes:", err);
        toast.error("Erro ao carregar configuracoes");
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  function updateField(key: string, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = Object.entries(config).map(([chave, valor]) => ({
        chave,
        valor,
      }));

      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erro ao salvar configuracoes");
        return;
      }

      toast.success("Configuracoes salvas com sucesso!");
    } catch {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse mb-2" />
          <div className="h-4 bg-gray-100 rounded-lg w-72 animate-pulse" />
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"
            />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-6">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-64 mb-3 animate-pulse" />
              <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentSection = TAB_SECTIONS.find((s) => s.key === activeTab);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configuracoes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as configuracoes do sistema
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Alteracoes
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 pb-px overflow-x-auto">
        {TAB_SECTIONS.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveTab(section.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === section.key
                ? "bg-white text-blue-600 border border-gray-200 border-b-white -mb-px"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {currentSection && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentSection.label}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {currentSection.fields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.key}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  {field.description}
                </p>

                {field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    value={config[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.key}
                    value={config[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.key}
                    type={field.type}
                    value={config[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
