"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao fazer login");
        return;
      }

      toast.success("Login realizado com sucesso!");
      router.push("/dashboard");
    } catch {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">P</div>
          <h1>PagFlow</h1>
          <p>Painel Administrativo</p>
        </div>

        {/* Card */}
        <div className="login-card">
          <h2>Bem-vindo de volta</h2>
          <p className="login-subtitle">Entre com suas credenciais para acessar o painel.</p>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label><span className="icon">🔒</span> Senha</label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="login-footer">PagFlow — Sistema de Agendamento de Entregas</p>
      </div>
    </div>
  );
}
