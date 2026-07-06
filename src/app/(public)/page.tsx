"use client";

import { useEffect, useState } from "react";

interface PublicConfig {
  empresa_nome: string;
  empresa_logo: string;
}

export default function MaintenancePage() {
  const [config, setConfig] = useState<PublicConfig>({ empresa_nome: "", empresa_logo: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/configuracoes/publicas")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setConfig({
            empresa_nome: json.data.empresa_nome || "",
            empresa_logo: json.data.empresa_logo || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #0a0a0b 100%)",
      fontFamily: "'Manrope', sans-serif",
      padding: "20px",
    }}>
      <div style={{
        maxWidth: "420px",
        width: "100%",
        textAlign: "center",
      }}>
        {!loading && config.empresa_logo ? (
          <img
            src={config.empresa_logo}
            alt={config.empresa_nome}
            style={{ height: "80px", width: "auto", objectFit: "contain", marginBottom: "32px" }}
          />
        ) : !loading ? (
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "16px",
            background: "#2E6B4F",
            color: "#fff",
            fontSize: "36px",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "32px",
          }}>E</div>
        ) : (
          <div style={{ height: "80px", marginBottom: "32px" }} />
        )}

        <h1 style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "#f1f5f9",
          margin: "0 0 12px",
        }}>Em breve estaremos de volta</h1>

        <p style={{
          fontSize: "16px",
          color: "#94a3b8",
          fontWeight: 600,
          lineHeight: 1.6,
          margin: "0 0 32px",
        }}>
          Estamos passando por uma manutenção para oferecer uma experiência ainda melhor para você. Aguarde um momento!
        </p>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "16px 24px",
          background: "rgba(46,107,79,0.2)",
          borderRadius: "12px",
          border: "1px solid rgba(46,107,79,0.3)",
        }}>
          <span style={{ fontSize: "20px" }}>🔧</span>
          <span style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#4ade80",
          }}>Manutenção em andamento</span>
        </div>

        <p style={{
          fontSize: "13px",
          color: "#475569",
          fontWeight: 600,
          marginTop: "48px",
        }}>
          &copy; {new Date().getFullYear()} {!loading ? (config.empresa_nome || "Elabela") : ""} Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
