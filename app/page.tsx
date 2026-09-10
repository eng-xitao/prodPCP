"use client";

import { FormEvent, useState } from "react";

const SMALL_WORDS = new Set(["de", "da", "do", "das", "dos", "e", "em", "com", "por", "para"]);

function properCase(value: string) {
  return value
    .toLocaleLowerCase("pt-BR")
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && SMALL_WORDS.has(word)) return word;
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    })
    .join(" ");
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function isValidCnpj(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;

  const calc = (length: number) => {
    let sum = 0;
    let weight = length - 7;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return calc(12) === Number(digits[12]) && calc(13) === Number(digits[13]);
}

export default function Home() {
  const [form, setForm] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    numeroObra: "",
    endereco: "",
    bairro: "",
    municipio: "",
    responsavel: "",
    telefone: "",
    abreviacao: "",
    tipoMaterial: "",
    clienteObra: "",
    tipoCadastro: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const update = (field: keyof typeof form, value: string) => {
    setMessage(null);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidCnpj(form.cnpj)) {
      setMessage({ type: "error", text: "Informe um CNPJ válido." });
      return;
    }

    const required: Array<keyof typeof form> = [
      "razaoSocial",
      "nomeFantasia",
      "endereco",
      "municipio",
      "tipoMaterial",
      "tipoCadastro",
    ];
    if (required.some((field) => !form[field].trim())) {
      setMessage({ type: "error", text: "Preencha os campos obrigatórios." });
      return;
    }

    setMessage({ type: "success", text: "Cadastro validado com sucesso. A gravação no banco será conectada na próxima etapa." });
  };

  const handleClear = () => {
    setForm({
      cnpj: "", razaoSocial: "", nomeFantasia: "", numeroObra: "", endereco: "", bairro: "",
      municipio: "", responsavel: "", telefone: "", abreviacao: "", tipoMaterial: "", clienteObra: "", tipoCadastro: "",
    });
    setMessage(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <img src="/prodpcp-logo.svg" alt="ProdPCP" className="logo" />
        <div className="menu-label">Cadastros</div>
        <button className="menu-item active" type="button">
          <span className="menu-icon">▦</span><span>Cliente e Fornecedor</span>
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">Cadastros &nbsp;/&nbsp; <strong>Cliente e Fornecedor</strong></div>
          <div className="user-chip"><span className="avatar">PCP</span> ProdPCP</div>
        </header>

        <section className="content">
          <div className="page-heading">
            <h1>Cadastro de Cliente e Fornecedor</h1>
            <p>Cadastre os dados comerciais e classifique o relacionamento da empresa.</p>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Dados cadastrais</h2>
                <div className="card-subtitle">Campos marcados com <span className="required">*</span> são obrigatórios.</div>
              </div>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <div className="grid">
                <div className="field span-4">
                  <label htmlFor="cnpj">CNPJ <span className="required">*</span></label>
                  <input id="cnpj" value={form.cnpj} onChange={(e) => update("cnpj", formatCnpj(e.target.value))} placeholder="00.000.000/0000-00" inputMode="numeric" maxLength={18} />
                </div>
                <div className="field span-8">
                  <label htmlFor="razaoSocial">Razão Social <span className="required">*</span></label>
                  <input id="razaoSocial" value={form.razaoSocial} onChange={(e) => update("razaoSocial", e.target.value)} onBlur={(e) => update("razaoSocial", properCase(e.target.value))} placeholder="Razão social da empresa" />
                </div>

                <div className="field span-6">
                  <label htmlFor="nomeFantasia">Nome Fantasia <span className="required">*</span></label>
                  <input id="nomeFantasia" value={form.nomeFantasia} onChange={(e) => update("nomeFantasia", e.target.value)} onBlur={(e) => update("nomeFantasia", properCase(e.target.value))} placeholder="Nome utilizado comercialmente" />
                </div>
                <div className="field span-6">
                  <label htmlFor="numeroObra">Nº Obra</label>
                  <input id="numeroObra" value={form.numeroObra} onChange={(e) => update("numeroObra", e.target.value)} placeholder="Número ou código da obra" />
                </div>

                <div className="field span-8">
                  <label htmlFor="endereco">Endereço <span className="required">*</span></label>
                  <input id="endereco" value={form.endereco} onChange={(e) => update("endereco", e.target.value)} onBlur={(e) => update("endereco", properCase(e.target.value))} placeholder="Rua, avenida, número, complemento" />
                </div>
                <div className="field span-4">
                  <label htmlFor="bairro">Bairro</label>
                  <input id="bairro" value={form.bairro} onChange={(e) => update("bairro", e.target.value)} onBlur={(e) => update("bairro", properCase(e.target.value))} placeholder="Bairro" />
                </div>

                <div className="field span-4">
                  <label htmlFor="municipio">Município <span className="required">*</span></label>
                  <input id="municipio" value={form.municipio} onChange={(e) => update("municipio", e.target.value)} onBlur={(e) => update("municipio", properCase(e.target.value))} placeholder="Município" />
                </div>
                <div className="field span-4">
                  <label htmlFor="responsavel">Responsável</label>
                  <input id="responsavel" value={form.responsavel} onChange={(e) => update("responsavel", e.target.value)} onBlur={(e) => update("responsavel", properCase(e.target.value))} placeholder="Nome do responsável" />
                </div>
                <div className="field span-4">
                  <label htmlFor="telefone">Telefone</label>
                  <input id="telefone" value={form.telefone} onChange={(e) => update("telefone", formatPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="tel" maxLength={15} />
                </div>

                <div className="field span-4">
                  <label htmlFor="abreviacao">Abreviação</label>
                  <input id="abreviacao" value={form.abreviacao} onChange={(e) => update("abreviacao", e.target.value.toUpperCase().slice(0, 20))} placeholder="Ex.: ABC" />
                </div>
                <div className="field span-4">
                  <label>Tipo de Material <span className="required">*</span></label>
                  <div className="type-group">
                    {['Ferro', 'Alumínio', 'Ambos'].map((type) => (
                      <button key={type} type="button" className={`type-option ${form.tipoMaterial === type ? 'selected' : ''}`} onClick={() => update("tipoMaterial", type)}>{type}</button>
                    ))}
                  </div>
                </div>
                <div className="field span-4">
                  <label htmlFor="clienteObra">Cliente / Obra</label>
                  <input id="clienteObra" value={form.clienteObra} onChange={(e) => update("clienteObra", e.target.value)} onBlur={(e) => update("clienteObra", properCase(e.target.value))} placeholder="Cliente ou identificação da obra" />
                </div>

                <div className="field span-12">
                  <label htmlFor="tipoCadastro">Obra? Fornecedor? Ou Belmonte? <span className="required">*</span></label>
                  <select id="tipoCadastro" value={form.tipoCadastro} onChange={(e) => update("tipoCadastro", e.target.value)}>
                    <option value="">Selecione uma classificação</option>
                    <option value="Obra">Obra</option>
                    <option value="Fornecedor">Fornecedor</option>
                    <option value="Belmonte">Belmonte</option>
                  </select>
                  <div className="hint">A classificação será usada para identificar o relacionamento deste cadastro no PCP.</div>
                </div>
              </div>

              <div className="actions">
                <button className="btn" type="button" onClick={handleClear}>Limpar</button>
                <button className="btn btn-primary" type="submit">Cadastrar</button>
              </div>
            </form>

            {message && <div className={`message ${message.type}`}>{message.text}</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
