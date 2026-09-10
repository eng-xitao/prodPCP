"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Cadastro = {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  numeroObra: string;
  endereco: string;
  bairro: string;
  municipio: string;
  responsavel: string;
  telefone: string;
  tipoMaterial: string;
  clienteObra: string;
  tipoCadastro: string;
};

const STORAGE_KEY = "prodpcp-cadastros";
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
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
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

function emptyForm(): Omit<Cadastro, "id"> {
  return {
    cnpj: "", razaoSocial: "", nomeFantasia: "", numeroObra: "", endereco: "", bairro: "",
    municipio: "", responsavel: "", telefone: "", tipoMaterial: "", clienteObra: "", tipoCadastro: "",
  };
}

export default function Home() {
  const [form, setForm] = useState(emptyForm());
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setCadastros(JSON.parse(saved));
    } catch {
      // Ignora dados locais inválidos.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cadastros));
  }, [cadastros]);

  const update = (field: keyof typeof form, value: string) => {
    setMessage(null);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const filteredCadastros = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return cadastros;
    return cadastros.filter((item) =>
      [item.cnpj, item.razaoSocial, item.nomeFantasia, item.municipio, item.tipoCadastro]
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(term))
    );
  }, [cadastros, search]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidCnpj(form.cnpj)) {
      setMessage({ type: "error", text: "Informe um CNPJ válido." });
      return;
    }

    const required: Array<keyof typeof form> = ["razaoSocial", "nomeFantasia", "endereco", "municipio", "tipoMaterial", "tipoCadastro"];
    if (required.some((field) => !form[field].trim())) {
      setMessage({ type: "error", text: "Preencha os campos obrigatórios." });
      return;
    }

    const normalizedCnpj = form.cnpj.replace(/\D/g, "");
    const duplicate = cadastros.find((item) => item.cnpj.replace(/\D/g, "") === normalizedCnpj && item.id !== editingId);
    if (duplicate) {
      setMessage({ type: "error", text: `Este CNPJ já está cadastrado como "${duplicate.nomeFantasia}".` });
      return;
    }

    if (editingId) {
      setCadastros((current) => current.map((item) => item.id === editingId ? { ...item, ...form } : item));
      setMessage({ type: "success", text: "Cadastro atualizado com sucesso." });
      setEditingId(null);
    } else {
      const novo: Cadastro = { id: crypto.randomUUID(), ...form };
      setCadastros((current) => [novo, ...current]);
      setMessage({ type: "success", text: "Cadastro realizado com sucesso." });
    }

    setForm(emptyForm());
  };

  const handleEdit = (item: Cadastro) => {
    setEditingId(item.id);
    setForm({ ...item, id: undefined as never });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClear = () => {
    setEditingId(null);
    setForm(emptyForm());
    setMessage(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <img src="/prodpcp-logo.svg" alt="ProdPCP" className="logo" />
        <div className="menu-label">Cadastros</div>
        <button className="menu-item active" type="button"><span className="menu-icon">▦</span><span>Cliente e Fornecedor</span></button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">Cadastros &nbsp;/&nbsp; <strong>Cliente e Fornecedor</strong></div>
          <div className="user-chip"><span className="avatar">PCP</span> ProdPCP</div>
        </header>

        <section className="content">
          <div className="page-heading">
            <h1>Cadastro de Cliente e Fornecedor</h1>
            <p>Cadastre, consulte e edite os dados comerciais dos seus clientes e fornecedores.</p>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">{editingId ? "Editar cadastro" : "Novo cadastro"}</h2>
                <div className="card-subtitle">Campos marcados com <span className="required">*</span> são obrigatórios. O CNPJ não pode ser repetido.</div>
              </div>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <div className="grid">
                <div className="field span-4"><label htmlFor="cnpj">CNPJ <span className="required">*</span></label><input id="cnpj" value={form.cnpj} onChange={(e) => update("cnpj", formatCnpj(e.target.value))} placeholder="00.000.000/0000-00" inputMode="numeric" maxLength={18} /></div>
                <div className="field span-8"><label htmlFor="razaoSocial">Razão Social <span className="required">*</span></label><input id="razaoSocial" value={form.razaoSocial} onChange={(e) => update("razaoSocial", e.target.value)} onBlur={(e) => update("razaoSocial", properCase(e.target.value))} placeholder="Razão social da empresa" /></div>
                <div className="field span-6"><label htmlFor="nomeFantasia">Nome Fantasia <span className="required">*</span></label><input id="nomeFantasia" value={form.nomeFantasia} onChange={(e) => update("nomeFantasia", e.target.value)} onBlur={(e) => update("nomeFantasia", properCase(e.target.value))} placeholder="Nome utilizado comercialmente" /></div>
                <div className="field span-6"><label htmlFor="numeroObra">Nº Obra</label><input id="numeroObra" value={form.numeroObra} onChange={(e) => update("numeroObra", e.target.value)} placeholder="Número ou código da obra" /></div>
                <div className="field span-8"><label htmlFor="endereco">Endereço <span className="required">*</span></label><input id="endereco" value={form.endereco} onChange={(e) => update("endereco", e.target.value)} onBlur={(e) => update("endereco", properCase(e.target.value))} placeholder="Rua, avenida, número, complemento" /></div>
                <div className="field span-4"><label htmlFor="bairro">Bairro</label><input id="bairro" value={form.bairro} onChange={(e) => update("bairro", e.target.value)} onBlur={(e) => update("bairro", properCase(e.target.value))} placeholder="Bairro" /></div>
                <div className="field span-4"><label htmlFor="municipio">Município <span className="required">*</span></label><input id="municipio" value={form.municipio} onChange={(e) => update("municipio", e.target.value)} onBlur={(e) => update("municipio", properCase(e.target.value))} placeholder="Município" /></div>
                <div className="field span-4"><label htmlFor="responsavel">Responsável</label><input id="responsavel" value={form.responsavel} onChange={(e) => update("responsavel", e.target.value)} onBlur={(e) => update("responsavel", properCase(e.target.value))} placeholder="Nome do responsável" /></div>
                <div className="field span-4"><label htmlFor="telefone">Telefone</label><input id="telefone" value={form.telefone} onChange={(e) => update("telefone", formatPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="tel" maxLength={15} /></div>
                <div className="field span-6"><label>Tipo de Material <span className="required">*</span></label><div className="type-group">{["Ferro", "Alumínio", "Ambos"].map((type) => <button key={type} type="button" className={`type-option ${form.tipoMaterial === type ? "selected" : ""}`} onClick={() => update("tipoMaterial", type)}>{type}</button>)}</div></div>
                <div className="field span-6"><label htmlFor="clienteObra">Cliente / Obra</label><input id="clienteObra" value={form.clienteObra} onChange={(e) => update("clienteObra", e.target.value)} onBlur={(e) => update("clienteObra", properCase(e.target.value))} placeholder="Cliente ou identificação da obra" /></div>
                <div className="field span-12"><label htmlFor="tipoCadastro">Obra? Fornecedor? Ou Belmonte? <span className="required">*</span></label><select id="tipoCadastro" value={form.tipoCadastro} onChange={(e) => update("tipoCadastro", e.target.value)}><option value="">Selecione uma classificação</option><option value="Obra">Obra</option><option value="Fornecedor">Fornecedor</option><option value="Belmonte">Belmonte</option></select></div>
              </div>
              <div className="actions"><button className="btn" type="button" onClick={handleClear}>{editingId ? "Cancelar" : "Limpar"}</button><button className="btn btn-primary" type="submit">{editingId ? "Salvar alterações" : "Cadastrar"}</button></div>
            </form>
            {message && <div className={`message ${message.type}`}>{message.text}</div>}
          </div>

          <div className="card list-card">
            <div className="card-header list-header">
              <div><h2 className="card-title">Clientes e fornecedores cadastrados</h2><div className="card-subtitle">Consulte rapidamente e edite os dados quando necessário.</div></div>
              <div className="record-count">{filteredCadastros.length} {filteredCadastros.length === 1 ? "registro" : "registros"}</div>
            </div>
            <div className="list-toolbar"><div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por CNPJ, razão social, nome fantasia, município..." /></div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>CNPJ</th><th>Razão Social</th><th>Nome Fantasia</th><th>Material</th><th>Tipo</th><th>Município</th><th className="action-col">Ação</th></tr></thead>
                <tbody>
                  {filteredCadastros.length === 0 ? <tr><td colSpan={7} className="empty-state">{search ? "Nenhum cadastro encontrado para esta busca." : "Nenhum cliente ou fornecedor cadastrado ainda."}</td></tr> : filteredCadastros.map((item) => (
                    <tr key={item.id}><td className="cnpj-cell">{item.cnpj}</td><td>{item.razaoSocial}</td><td><strong>{item.nomeFantasia}</strong></td><td>{item.tipoMaterial}</td><td><span className="badge">{item.tipoCadastro}</span></td><td>{item.municipio}</td><td className="action-col"><button className="edit-btn" type="button" onClick={() => handleEdit(item)}>Editar</button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
