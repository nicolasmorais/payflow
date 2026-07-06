"use client";

import { useEffect, useState } from "react";

interface PublicConfig {
  empresa_nome: string;
  empresa_logo: string;
}

export default function MaintenancePage() {
  const [config, setConfig] = useState<PublicConfig>({ empresa_nome: "", empresa_logo: "" });

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
      .catch(() => {});
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#F5F5F5",
      fontFamily: "'Manrope', sans-serif",
      padding: "20px",
    }}>
      <div style={{
        maxWidth: "420px",
        width: "100%",
        textAlign: "center",
      }}>
        {config.empresa_logo ? (
          <img
            src={config.empresa_logo}
            alt={config.empresa_nome}
            style={{ height: "80px", width: "auto", objectFit: "contain", marginBottom: "32px" }}
          />
        ) : (
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
        )}

        <h1 style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "#1F2A24",
          margin: "0 0 12px",
        }}>Em breve estaremos de volta</h1>

        <p style={{
          fontSize: "16px",
          color: "#4B5A50",
          fontWeight: 600,
          lineHeight: 1.6,
          margin: "0 0 32px",
        }}>
          Estamos passando por uma manutenção para oferecer uma experiência ainda melhor para você. Aguarde um momento!
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "16px",
          background: "#EAF6EE",
          borderRadius: "12px",
          border: "1px solid #DCE5DD",
        }}>
          <span style={{ fontSize: "20px" }}>🔧</span>
          <span style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#204F3A",
          }}>Manutenção em andamento</span>
        </div>

        <p style={{
          fontSize: "13px",
          color: "#94a3b8",
          fontWeight: 600,
          marginTop: "32px",
        }}>
          &copy; {new Date().getFullYear()} {config.empresa_nome || "Elabela"}. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
