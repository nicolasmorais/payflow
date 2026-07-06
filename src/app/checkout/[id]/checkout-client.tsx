"use client";

import { useState, useEffect, useRef } from "react";
import { getUTMParams } from "@/lib/utils";
import { PixelScripts } from "@/components/pixels/pixel-scripts";
import "../checkout.css";

interface Produto {
  id: string;
  nome: string;
  imagem_url: string | null;
  preco: number;
}

interface CheckoutClientProps {
  produto: Produto;
}

interface PublicConfig {
  logo_checkout: string;
}

export default function CheckoutClient({ produto }: CheckoutClientProps) {
  const [screen, setScreen] = useState<"checkout" | "success">("checkout");
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("#000000");
  const [cepStatus, setCepStatus] = useState(false);
  const [config, setConfig] = useState<PublicConfig>({ logo_checkout: "" });

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

    fetch("/api/configuracoes/publicas")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setConfig({ logo_checkout: json.data.logo_checkout || "" });
        }
      })
      .catch(() => {});
  }, []);

  function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

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

  function showError(campo: string) {
    document.getElementById(campo)?.classList.add("invalid");
    document.getElementById(`erro-${campo}`)?.classList.add("show");
  }

  function clearError(campo: string) {
    document.getElementById(campo)?.classList.remove("invalid");
    document.getElementById(`erro-${campo}`)?.classList.remove("show");
  }

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
    if (raw.length === 8) buscarEndereco(raw);
  }

  function validarCPF(cpf: string) { return cpf.replace(/\D/g, "").length === 11; }
  function validarTelefone(tel: string) { const n = tel.replace(/\D/g, ""); return n.length === 10 || n.length === 11; }
  function validarCEP(cep: string) { return cep.replace(/\D/g, "").length === 8; }

  async function handleSubmit(e: React.FormEvent) {
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

    setLoading(true);
    try {
      const raw = (window as any).__utms || {};
      const utms = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v != null && v !== "")
      );
      const payload = {
        nome,
        telefone: telefone.replace(/\D/g, ""),
        cpf: cpf.replace(/\D/g, ""),
        cep: cep.replace(/\D/g, ""),
        rua,
        numero_endereco: numero,
        complemento,
        bairro,
        cidade,
        estado: estado.toUpperCase(),
        produto: produto.nome,
        quantidade: 1,
        valor: produto.preco,
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
        throw new Error(error?.error || "Erro ao criar pedido");
      }

      const result = await response.json();
      setOrderNumber(`#${String(result.data?.numero || result.numero || Math.floor(100000 + Math.random() * 900000)).padStart(6, "0")}`);
      setScreen("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao enviar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
    [ruaRef, bairroRef, cidadeRef, estadoRef, numRef, compRef].forEach(ref => {
      if (ref.current) { ref.current.classList.remove("filled", "attention"); }
    });
    setScreen("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="checkout-page">
      <PixelScripts pageType={screen === "success" ? "confirmation" : "checkout"} />

      {screen === "checkout" && (
        <div className="screen">
          <div className="centered-logo">
            {config.logo_checkout ? (
              <img src={config.logo_checkout} alt="Logo" />
            ) : (
              <div className="default-logo">E</div>
            )}
          </div>

          <div className="card order-card">
            <div className="order-thumb">
              {produto.imagem_url ? (
                <img src={produto.imagem_url} alt={produto.nome} style={{ width: 50, height: 50, borderRadius: 3, objectFit: "cover" }} />
              ) : "🧴"}
            </div>
            <div className="order-info">
              <p className="order-name">{produto.nome}</p>
              <p className="order-detail">Entrega grátis</p>
            </div>
            <div className="order-price">{formatCurrency(produto.preco)}</div>
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

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Enviando pedido..." : "Finalizar pedido"}
            </button>
            <div className="trust-row">🔒 Seus dados estão protegidos e seguros</div>
          </form>
        </div>
      )}

      {screen === "success" && (
        <div className="screen">
          <div className="centered-logo">
            {config.logo_checkout ? (
              <img src={config.logo_checkout} alt="Logo" />
            ) : (
              <div className="default-logo">E</div>
            )}
          </div>

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
                <div className="explain-item"><div className="explain-num">1</div><div className="explain-text"><strong>Preparamos seu pedido</strong><span>Seu pedido é separado e preparado com todo o cuidado.</span></div></div>
                <div className="explain-item"><div className="explain-num">2</div><div className="explain-text"><strong>Entregamos no endereço informado</strong><span>Nossos entregadores realizam a entrega no endereço cadastrado.</span></div></div>
                <div className="explain-item"><div className="explain-num">3</div><div className="explain-text"><strong>Você recebe primeiro</strong><span>Confira se está tudo certo com o seu pedido no momento da entrega.</span></div></div>
                <div className="explain-item"><div className="explain-num">4</div><div className="explain-text"><strong>Pagamento após a entrega</strong><span>Após a confirmação da entrega, entraremos em contato pelo WhatsApp para realizar a cobrança.</span></div></div>
              </div>
            </div>
            <div className="help-card">
              <div className="icon">💬</div>
              <p>Precisa de ajuda? Chame no WhatsApp (00) 00000-0000</p>
            </div>
            <button type="button" className="btn-secondary" onClick={voltarInicio}>Fazer outro pedido</button>
          </div>
        </div>
      )}

      <footer className="checkout-footer">
        <p>&copy; 2025 Elabela. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
