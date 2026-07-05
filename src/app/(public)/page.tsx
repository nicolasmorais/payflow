"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUTMParams } from "@/lib/utils";
import "./checkout.css";

export default function CheckoutPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<"checkout" | "review" | "success">("checkout");
  const [showReview, setShowReview] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("#000000");
  const [cepStatus, setCepStatus] = useState(false);


  // Review data
  const [resumo, setResumo] = useState({
    nome: "", cpf: "", telefone: "",
    endereco: "", bairro: "", cidade: "", cep: "",
  });

  // Refs
  const nomeRef = useRef<HTMLInputElement>(null);
  const cpfRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const cepRef = useRef<HTMLInputElement>(null);
  const ruaRef = useRef<HTMLInputElement>(null);
  const numRef = useRef<HTMLInputElement>(null);
  const compRef = useRef<HTMLInputElement>(null);
  const bairroRef = useRef<HTMLInputElement>(null);
  const cidadeRef = useRef<HTMLInputElement>(null);
  const estadoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const utms = getUTMParams();
    (window as any).__utms = utms;
  }, []);

  // ── Masks ──
  function maskCPF(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length > 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
    if (d.length > 6) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    if (d.length > 3) return `${d.slice(0,3)}.${d.slice(3)}`;
    return d;
  }

  function maskPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length > 6) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    if (d.length > 2) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length > 0) return `(${d}`;
    return "";
  }

  function maskCEP(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length > 5) return `${d.slice(0,5)}-${d.slice(5)}`;
    return d;
  }

  // ── Error helpers ──
  function showError(campo: string) {
    document.getElementById(campo)?.classList.add("invalid");
    document.getElementById(`erro-${campo}`)?.classList.add("show");
  }

  function clearError(campo: string) {
    document.getElementById(campo)?.classList.remove("invalid");
    document.getElementById(`erro-${campo}`)?.classList.remove("show");
  }

  // ── CEP auto-fill ──
  const cepTimer = useRef<ReturnType<typeof setTimeout>>(null);

  async function buscarEndereco(cep: string) {
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) { showError("cep"); return; }
      if (ruaRef.current) { ruaRef.current.value = d.logradouro || ""; ruaRef.current.classList.add("filled"); }
      if (bairroRef.current) { bairroRef.current.value = d.bairro || ""; bairroRef.current.classList.add("filled"); }
      if (cidadeRef.current) { cidadeRef.current.value = d.localidade || ""; cidadeRef.current.classList.add("filled"); }
      if (estadoRef.current) { estadoRef.current.value = d.uf || ""; estadoRef.current.classList.add("filled"); }
      if (numRef.current) { numRef.current.classList.add("attention"); }
      if (compRef.current) { compRef.current.classList.add("attention"); }
      setCepStatus(true);
      clearError("cep");
      numRef.current?.focus();
    } catch {}
  }

  function handleCepInput(val: string) {
    const formatted = maskCEP(val);
    if (cepRef.current) cepRef.current.value = formatted;
    clearError("cep");
    setCepStatus(false);

    [ruaRef, bairroRef, cidadeRef, estadoRef, numRef, compRef].forEach(ref => {
      if (ref.current) { ref.current.classList.remove("filled", "attention"); }
    });

    const raw = formatted.replace(/\D/g, "");
    if (raw.length === 8) {
      buscarEndereco(raw);
    }
  }

  // ── Validation ──
  function validarCPF(cpf: string) { return cpf.replace(/\D/g, "").length === 11; }
  function validarTelefone(tel: string) { const n = tel.replace(/\D/g, ""); return n.length === 10 || n.length === 11; }
  function validarCEP(cep: string) { return cep.replace(/\D/g, "").length === 8; }

  // ── Submit → Review ──
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valido = true;

    function checar(cond: boolean, campo: string) {
      if (!cond) { showError(campo); valido = false; }
      else { clearError(campo); }
    }

    const nome = nomeRef.current?.value?.trim() || "";
    const cpf = cpfRef.current?.value || "";
    const telefone = telRef.current?.value || "";
    const cep = cepRef.current?.value || "";
    const rua = ruaRef.current?.value?.trim() || "";
    const numero = numRef.current?.value?.trim() || "";
    const complemento = compRef.current?.value?.trim() || "";
    const bairro = bairroRef.current?.value?.trim() || "";
    const cidade = cidadeRef.current?.value?.trim() || "";
    const estado = estadoRef.current?.value?.trim() || "";

    checar(nome.split(" ").filter(Boolean).length >= 2, "nome");
    checar(validarCPF(cpf), "cpf");
    checar(validarTelefone(telefone), "telefone");
    checar(validarCEP(cep), "cep");
    checar(rua.length > 0, "rua");
    checar(numero.length > 0, "numero");
    checar(bairro.length > 0, "bairro");
    checar(cidade.length > 0, "cidade");
    checar(estado.length === 2, "estado");

    if (!valido) {
      const el = document.querySelector(".invalid");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setResumo({
      nome, cpf, telefone,
      endereco: `${rua}, ${numero}${complemento ? " - " + complemento : ""}`,
      bairro,
      cidade: `${cidade} / ${estado.toUpperCase()}`,
      cep,
    });

    setScreen("review");
    setShowReview(true);
    setShowSuccess(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Confirm → API ──
  async function confirmarPedido() {
    setLoading(true);
    try {
      const utms = (window as any).__utms || {};
      const payload = {
        nome: nomeRef.current?.value?.trim() || "",
        telefone: (telRef.current?.value || "").replace(/\D/g, ""),
        cpf: (cpfRef.current?.value || "").replace(/\D/g, ""),
        cep: (cepRef.current?.value || "").replace(/\D/g, ""),
        rua: ruaRef.current?.value?.trim() || "",
        numero_endereco: numRef.current?.value?.trim() || "",
        complemento: compRef.current?.value?.trim() || "",
        bairro: bairroRef.current?.value?.trim() || "",
        cidade: cidadeRef.current?.value?.trim() || "",
        estado: (estadoRef.current?.value || "").toUpperCase(),
        produto: "Dermavit C",
        quantidade: 1,
        valor: 89.9,
        data_entrega: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        horario: "10:00",
        observacoes: "",
        ...utms,
      };

      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Erro ao criar pedido");
      }

      const result = await response.json();
      setOrderNumber(`#${String(result.numero || Math.floor(100000 + Math.random() * 900000)).padStart(6, "0")}`);
      setShowReview(false);
      setShowSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao enviar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function voltarParaEditar() {
    setScreen("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function voltarInicio() {
    nomeRef.current && (nomeRef.current.value = "");
    cpfRef.current && (cpfRef.current.value = "");
    telRef.current && (telRef.current.value = "");
    cepRef.current && (cepRef.current.value = "");
    ruaRef.current && (ruaRef.current.value = "");
    numRef.current && (numRef.current.value = "");
    compRef.current && (compRef.current.value = "");
    bairroRef.current && (bairroRef.current.value = "");
    cidadeRef.current && (cidadeRef.current.value = "");
    estadoRef.current && (estadoRef.current.value = "");
    setCepStatus(false);
    setScreen("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="checkout-page">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand">
            <div className="brand-logo">E</div>
            <div>
              <div className="brand-name">Elabela</div>
              <div className="brand-tag">Cuidados para sua pele</div>
            </div>
          </div>
          <div className="secure-badge">🔒 Compra segura</div>
        </div>
      </header>

      {/* ── Checkout Screen ── */}
      {screen === "checkout" && (
        <div className="screen">
          <div className="card order-card">
            <div className="order-thumb">🧴</div>
            <div className="order-info">
              <p className="order-name">Dermavit C</p>
              <p className="order-detail">Sérum Vitamina C · 1 unidade</p>
            </div>
            <div className="order-price">R$ 89,90</div>
          </div>

          <div className="cod-banner">
            <div className="icon">⚠️</div>
            <p><span className="eyebrow">Atenção</span>Você só paga quando o produto chegar na sua casa. Não precisa pagar agora.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <p className="section-title">🙋 Seus dados</p>
            <div className="card">
              <div className="field">
                <label><span className="icon">🙂</span> Nome completo</label>
                <p className="hint">Digite seu nome, igual está no seu documento.</p>
                <input ref={nomeRef} type="text" id="nome" placeholder="Nome completo" autoComplete="name" onInput={() => clearError("nome")} />
                <div className="error-msg" id="erro-nome">⚠️ Por favor, digite seu nome completo.</div>
              </div>

              <div className="field">
                <label><span className="icon">🪪</span> CPF</label>
                <p className="hint">Digite só os números do seu CPF.</p>
                <input ref={cpfRef} type="text" id="cpf" placeholder="000.000.000-00" inputMode="numeric" maxLength={14}
                  onInput={(e) => { (e.target as HTMLInputElement).value = maskCPF((e.target as HTMLInputElement).value); clearError("cpf"); }} />
                <div className="error-msg" id="erro-cpf">⚠️ Digite um CPF válido, com 11 números.</div>
              </div>

              <div className="field">
                <label><span className="icon">📞</span> Telefone (WhatsApp)</label>
                <p className="hint">Vamos usar para avisar sobre a entrega.</p>
                <input ref={telRef} type="text" id="telefone" placeholder="(00) 00000-0000" inputMode="numeric" maxLength={15}
                  onInput={(e) => { (e.target as HTMLInputElement).value = maskPhone((e.target as HTMLInputElement).value); clearError("telefone"); }} />
                <div className="error-msg" id="erro-telefone">⚠️ Digite um telefone válido, com DDD.</div>
              </div>
            </div>

            <p className="section-title">🏠 Endereço de entrega</p>
            <div className="card">
              <div className="field">
                <label><span className="icon">📮</span> CEP</label>
                <p className="hint">Digite o CEP e preenchemos o endereço para você.</p>
                <input ref={cepRef} type="text" id="cep" placeholder="00000-000" inputMode="numeric" maxLength={9}
                  onInput={(e) => handleCepInput((e.target as HTMLInputElement).value)} />
                <div className={`cep-status ${cepStatus ? "show" : ""}`}>✅ Endereço encontrado</div>
                <div className="error-msg" id="erro-cep">⚠️ Digite um CEP válido, com 8 números.</div>
              </div>

              <div className="field">
                <label><span className="icon">🛣️</span> Rua / Avenida</label>
                <input ref={ruaRef} type="text" id="rua" placeholder="Rua / Avenida" onInput={(e) => { clearError("rua"); (e.target as HTMLInputElement).classList.remove("filled"); }} />
                <div className="error-msg" id="erro-rua">⚠️ Digite o nome da rua.</div>
              </div>

              <div className="row-2">
                <div className="field small">
                  <label><span className="icon">🔢</span> Número</label>
                  <input ref={numRef} type="text" id="numero" placeholder="Número" inputMode="numeric" onInput={(e) => { clearError("numero"); (e.target as HTMLInputElement).classList.remove("attention"); (e.target as HTMLInputElement).classList.add("filled"); }} />
                  <div className="error-msg" id="erro-numero">⚠️ Digite o número.</div>
                </div>
                <div className="field">
                  <label><span className="icon">🏢</span> Complemento</label>
                  <input ref={compRef} type="text" id="complemento" placeholder="Apto, casa, bloco (opcional)" onInput={(e) => { (e.target as HTMLInputElement).classList.remove("attention"); (e.target as HTMLInputElement).classList.add("filled"); }} />
                </div>
              </div>

              <div className="field">
                <label><span className="icon">📍</span> Bairro</label>
                <input ref={bairroRef} type="text" id="bairro" placeholder="Bairro" onInput={(e) => { clearError("bairro"); (e.target as HTMLInputElement).classList.remove("filled"); }} />
                <div className="error-msg" id="erro-bairro">⚠️ Digite o bairro.</div>
              </div>

              <div className="row-2">
                <div className="field">
                  <label><span className="icon">🏙️</span> Cidade</label>
                  <input ref={cidadeRef} type="text" id="cidade" placeholder="Cidade" onInput={(e) => { clearError("cidade"); (e.target as HTMLInputElement).classList.remove("filled"); }} />
                  <div className="error-msg" id="erro-cidade">⚠️ Digite a cidade.</div>
                </div>
                <div className="field small">
                  <label><span className="icon">🗺️</span> Estado</label>
                  <input ref={estadoRef} type="text" id="estado" placeholder="UF" maxLength={2}
                    onInput={(e) => { (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.toUpperCase(); clearError("estado"); (e.target as HTMLInputElement).classList.remove("filled"); }} />
                  <div className="error-msg" id="erro-estado">⚠️ Digite o estado (sigla).</div>
                </div>
              </div>
            </div>

            <p className="pre-submit-note"><span className="whatsapp-icon">💬</span> Depois do pedido, vamos te ligar ou mandar mensagem no <strong>WhatsApp</strong> para confirmar antes de enviar.</p>

            <button type="submit" className="btn-primary">Continuar</button>
            <div className="trust-row">🔒 Seus dados estão protegidos e seguros</div>
          </form>
        </div>
      )}

      {/* ── Review Screen ── */}
      {screen === "review" && (
        <div className="screen">
          {showReview && (
            <div>
              <h1>Confira antes de finalizar</h1>
              <p className="subtitle">Veja se tudo está certo. Se precisar, você pode corrigir.</p>

              <div className="card order-card">
                <div className="order-thumb">🧴</div>
                <div className="order-info">
                  <p className="order-name">Dermavit C</p>
                  <p className="order-detail">Sérum Vitamina C · 1 unidade</p>
                </div>
                <div className="order-price">R$ 89,90</div>
              </div>

              <div className="card">
                <div className="review-group">
                  <p className="review-group-title">Seus dados</p>
                  <div className="review-row">
                    <span className="label">Nome completo</span>
                    <span className="value">{resumo.nome}</span>
                  </div>
                  <div className="review-row">
                    <span className="label">CPF</span>
                    <span className="value">{resumo.cpf}</span>
                  </div>
                  <div className="review-row">
                    <span className="label">Telefone</span>
                    <span className="value">{resumo.telefone}</span>
                  </div>
                </div>

                <div className="review-group">
                  <p className="review-group-title">Endereço de entrega</p>
                  <div className="review-row">
                    <span className="label">Endereço</span>
                    <span className="value">{resumo.endereco}</span>
                  </div>
                  <div className="review-row">
                    <span className="label">Bairro</span>
                    <span className="value">{resumo.bairro}</span>
                  </div>
                  <div className="review-row">
                    <span className="label">Cidade / Estado</span>
                    <span className="value">{resumo.cidade}</span>
                  </div>
                  <div className="review-row">
                    <span className="label">CEP</span>
                    <span className="value">{resumo.cep}</span>
                  </div>
                </div>

                <button type="button" className="edit-link" onClick={voltarParaEditar}>✏️ Corrigir meus dados</button>
              </div>

              <div className="cod-banner">
                <div className="icon">⚠️</div>
                <p><span className="eyebrow">Atenção</span>Você só paga quando o produto chegar na sua casa. Não precisa pagar agora.</p>
              </div>

              <button type="button" className="btn-primary" onClick={confirmarPedido} disabled={loading}>
                {loading ? "Processando..." : "Confirmar pedido"}
              </button>
            </div>
          )}

          {showSuccess && (
            <div>
              <div className="confirm-hero">
                <div className="check-circle">✓</div>
                <h1>Pedido confirmado!</h1>
                <p>Muito obrigado pela sua compra. Seu pedido já está sendo preparado.</p>
              </div>

              <div className="order-number">
                <span>NÚMERO DO SEU PEDIDO</span>
                <strong>{orderNumber}</strong>
              </div>

              <div className="card">
                <p className="step-label" style={{ marginBottom: 16 }}>O que acontece agora:</p>
                <div className="steps-explain">
                  <div className="explain-item">
                    <div className="explain-num">1</div>
                    <div className="explain-text">
                      <strong>Preparamos seu produto</strong>
                      <span>Sua encomenda é embalada com cuidado.</span>
                    </div>
                  </div>
                  <div className="explain-item">
                    <div className="explain-num">2</div>
                    <div className="explain-text">
                      <strong>Enviamos para sua casa</strong>
                      <span>O entregador vai até o endereço informado.</span>
                    </div>
                  </div>
                  <div className="explain-item">
                    <div className="explain-num">3</div>
                    <div className="explain-text">
                      <strong>Você paga na entrega</strong>
                      <span>Pague em dinheiro ou cartão direto ao entregador.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="help-card">
                <div className="icon">💬</div>
                <p>Precisa de ajuda? Chame no WhatsApp (00) 00000-0000</p>
              </div>

              <button type="button" className="btn-secondary" onClick={voltarInicio}>Fazer outro pedido</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
