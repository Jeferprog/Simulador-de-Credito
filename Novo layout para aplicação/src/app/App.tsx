import { useState } from "react";
import {
  Search, User, ChevronRight, BarChart2, Clock, Star,
  Settings, AlertCircle, Info, Check, X, Plus, Lock,
  TrendingUp, DollarSign, Shield, Percent, FileText,
  ChevronDown, LayoutDashboard
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = "simulador" | "especial" | "historico" | "dashboard" | "admin";
type ModoCliente = "associado" | "prospect";
type SubEspecial = "lotePrazos" | "loteModalidades" | "composta";

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ children, variant = "orange" }: { children: React.ReactNode; variant?: "orange" | "green" | "gray" }) {
  const styles = {
    orange: "bg-[#f58220] text-white",
    green: "bg-[#005c46] text-white",
    gray: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-bold uppercase tracking-widest text-[#005c46] border-b border-[#005c46]/10 pb-2 mb-4"
      style={{ fontFamily: "'Roboto Slab', serif" }}
    >
      {children}
    </h2>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <span className="text-xs text-red-500">{hint}</span>}
    </div>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-[#005c46]/30 focus:border-[#005c46] transition-all ${className}`}
      {...props}
    />
  );
}

function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800
        focus:outline-none focus:ring-2 focus:ring-[#005c46]/30 focus:border-[#005c46] transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

function Card({ children, accent, className = "" }: { children: React.ReactNode; accent?: "orange" | "green"; className?: string }) {
  const border = accent === "orange"
    ? "border-l-4 border-l-[#f58220]"
    : accent === "green"
    ? "border-l-4 border-l-[#005c46]"
    : "";
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${border} ${className}`}>
      {children}
    </div>
  );
}

function ToggleGroup({ options, value, onChange }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 px-2 transition-colors ${
            value === o.value
              ? "bg-[#005c46] text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const navItems: { id: Tab; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: "simulador", label: "Simulação Simples", icon: FileText },
  { id: "especial", label: "Simulações Especiais", icon: Star },
  { id: "historico", label: "Histórico", icon: Clock },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: true },
  { id: "admin", label: "Painel Admin", icon: Settings, adminOnly: true },
];

function Sidebar({ active, onNav, isAdmin }: { active: Tab; onNav: (t: Tab) => void; isAdmin: boolean }) {
  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[#005c46] min-h-screen">
      {/* Logo area */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#f58220] flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'Roboto Slab', serif" }}>
            Cresol
          </span>
        </div>
        <p className="text-[#a8d5c7] text-xs ml-10">Simulador de Crédito</p>
        <span className="ml-10 inline-block mt-1 bg-[#f58220] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          2026
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.filter(n => !n.adminOnly || isAdmin).map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-[#a8d5c7] hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#f58220]/20 flex items-center justify-center">
            <User size={13} className="text-[#f58220]" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold leading-none">Carlos M. Silva</p>
            <p className="text-[#a8d5c7] text-[10px] mt-0.5">Gerente de Crédito</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Associate block ───────────────────────────────────────────────────────────

function AssociateBlock({ locked }: { locked?: boolean }) {
  const [modo, setModo] = useState<ModoCliente>("associado");
  const [conta, setConta] = useState("");
  const [nomeAssociado, setNomeAssociado] = useState("");
  const [score, setScore] = useState("");
  const [nomeProspect, setNomeProspect] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState("PF");
  const [enquadramento, setEnquadramento] = useState("GERAL");

  return (
    <Card accent="orange" className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#005c46] text-sm uppercase tracking-wider" style={{ fontFamily: "'Roboto Slab', serif" }}>
          Dados do Cliente
        </h3>
        <ToggleGroup
          options={[
            { value: "associado", label: "Já é Associado" },
            { value: "prospect", label: "Novo Prospect" },
          ]}
          value={modo}
          onChange={v => setModo(v as ModoCliente)}
        />
      </div>

      {modo === "associado" ? (
        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-3">
            <Field label="Número da Conta">
              <div className="flex">
                <Input
                  type="number"
                  placeholder="Digite a conta"
                  value={conta}
                  onChange={e => setConta(e.target.value)}
                  className="rounded-r-none"
                />
                <button className="px-3 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg text-gray-400 hover:text-[#005c46] transition-colors">
                  <Search size={14} />
                </button>
              </div>
            </Field>
          </div>
          <div className="col-span-2">
            <button className="w-full bg-[#f58220] hover:bg-[#d97018] text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
              Buscar
            </button>
          </div>
          <div className="col-span-5">
            <Field label="Nome do Associado">
              <Input value={nomeAssociado} readOnly placeholder="—" className="bg-gray-50 cursor-default" />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Score">
              <Input
                type="number"
                placeholder="0–1000"
                value={score}
                onChange={e => setScore(e.target.value)}
              />
            </Field>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6">
              <Field label="Nome do Prospect">
                <Input
                  placeholder="Nome completo"
                  value={nomeProspect}
                  onChange={e => setNomeProspect(e.target.value)}
                />
              </Field>
            </div>
            <div className="col-span-3">
              <Field label="Tipo de Pessoa">
                <Select value={tipoPessoa} onChange={e => setTipoPessoa(e.target.value)}>
                  <option value="PF">Pessoa Física (PF)</option>
                  <option value="PJ">Pessoa Jurídica (PJ)</option>
                </Select>
              </Field>
            </div>
            <div className="col-span-3">
              <Field label="Score Estimado">
                <Input type="number" placeholder="0 a 1000" value={score} onChange={e => setScore(e.target.value)} />
              </Field>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <Field label="Enquadramento">
                <Select
                  value={enquadramento}
                  onChange={e => setEnquadramento(e.target.value)}
                  disabled={tipoPessoa === "PF"}
                  className={tipoPessoa === "PF" ? "bg-gray-50 cursor-not-allowed" : ""}
                >
                  <option value="GERAL">Geral / Normal</option>
                  <option value="MEI">MEI</option>
                  <option value="SIMPLES">Simples Nacional</option>
                </Select>
              </Field>
            </div>
            <div className="col-span-3">
              <Field label="Idade do Prospect">
                <Input type="number" placeholder="Anos" />
              </Field>
            </div>
          </div>

          {/* Grupo Econômico */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Composição do Grupo Econômico</span>
              <button className="flex items-center gap-1 text-xs text-[#005c46] font-semibold border border-[#005c46]/20 rounded-lg px-3 py-1 hover:bg-[#005c46]/5 transition-colors">
                <Plus size={11} /> Adicionar Membro
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Preencha renda e endividamento para calcular comprometimento de renda.</p>
            <div className="grid grid-cols-12 gap-2 items-center bg-[#005c46]/5 border border-[#005c46]/10 rounded-lg p-2">
              <div className="col-span-4 relative">
                <Input className="text-xs py-1.5 bg-gray-50 cursor-not-allowed" readOnly placeholder="Nome do Prospect" />
                <span className="absolute -top-1.5 left-2 text-[9px] font-bold bg-[#005c46] text-white px-1.5 rounded">Proponente</span>
              </div>
              <div className="col-span-2">
                <Input className="text-xs py-1.5 bg-gray-50 cursor-not-allowed" readOnly placeholder="Tipo" />
              </div>
              <div className="col-span-3">
                <Input className="text-xs py-1.5" placeholder="Renda (R$)" />
              </div>
              <div className="col-span-2">
                <Input className="text-xs py-1.5" placeholder="Endiv. (R$)" />
              </div>
              <div className="col-span-1 flex justify-end">
                <Lock size={12} className="text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Simulator screen ──────────────────────────────────────────────────────────

function SwitchField({ label, checked, onChange, value }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; value?: string;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(!checked)}
          className={`w-9 h-5 rounded-full relative transition-colors ${checked ? "bg-[#005c46]" : "bg-gray-200"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
        </button>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      {value && <span className="text-xs font-bold text-[#005c46]">{value}</span>}
    </label>
  );
}

function ResumoItem({ label, value, type = "normal" }: { label: string; value: string; type?: "normal" | "danger" | "green" }) {
  const valueClass = type === "danger" ? "text-red-500" : type === "green" ? "text-[#005c46]" : "text-gray-800";
  return (
    <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className={`text-xs font-bold ${valueClass}`}>{value}</span>
    </li>
  );
}

function SimuladorScreen({ locked }: { locked?: boolean }) {
  const [modoCalculo, setModoCalculo] = useState("bruto");
  const [chkTac, setChkTac] = useState(false);
  const [chkSeguro, setChkSeguro] = useState(true);
  const [chkCota, setChkCota] = useState(false);
  const [chkCustas, setChkCustas] = useState(false);
  const [tipoIof, setTipoIof] = useState("normal");

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left column */}
      <div className="col-span-8 space-y-4">
        {/* Parâmetros */}
        <Card accent="orange" className={locked ? "opacity-50 pointer-events-none" : ""}>
          <SectionTitle>Parâmetros do Financiamento</SectionTitle>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <Field label="Modalidade de Financiamento">
                <div className="flex">
                  <Input readOnly placeholder="Selecione uma modalidade..." className="rounded-r-none bg-gray-50 cursor-pointer" />
                  <button className="px-4 text-xs font-semibold border border-l-0 border-gray-200 rounded-r-lg text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors">
                    Consultar Opções
                  </button>
                </div>
              </Field>
            </div>

            <div className="col-span-4">
              <Field label="Valor Financiado">
                <div className="space-y-1">
                  <ToggleGroup
                    options={[{ value: "bruto", label: "Pelo Bruto" }, { value: "liquido", label: "Pelo Líquido" }]}
                    value={modoCalculo}
                    onChange={setModoCalculo}
                  />
                  <input
                    type="text"
                    defaultValue="0,00"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-lg font-bold text-[#005c46] focus:outline-none focus:ring-2 focus:ring-[#005c46]/30 focus:border-[#005c46] transition-all"
                  />
                </div>
              </Field>
            </div>

            <div className="col-span-4">
              <Field label="Periodicidade (Normativo)">
                <Select>
                  <option>Mensal</option>
                  <option>Semestral</option>
                  <option>Anual</option>
                </Select>
              </Field>
            </div>
            <div className="col-span-4">
              <Field label="Data 1º Vencimento">
                <Input type="date" />
              </Field>
            </div>
            <div className="col-span-4">
              <Field label="Nº de Parcelas">
                <Input type="number" min={1} placeholder="—" />
              </Field>
            </div>
          </div>
        </Card>

        {/* Custos */}
        <Card className={locked ? "opacity-50 pointer-events-none" : ""}>
          <SectionTitle>Custos Adicionais da Operação</SectionTitle>
          <div className="grid grid-cols-2 gap-6">
            {/* Left half */}
            <div className="space-y-4 border-r border-gray-100 pr-6">
              <div className="space-y-2">
                <SwitchField label="TAC" checked={chkTac} onChange={setChkTac} value="R$ 0,00" />
                {chkTac && (
                  <Field label="Valor TAC (%)">
                    <Input type="number" defaultValue="0" step="0.01" />
                  </Field>
                )}
              </div>
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <SwitchField label="Seguro Prestamista" checked={chkSeguro} onChange={setChkSeguro} value="R$ 0,00" />
                {chkSeguro && (
                  <Field label="Formato do Seguro">
                    <Select>
                      <option>Integral</option>
                      <option>Anual</option>
                    </Select>
                  </Field>
                )}
              </div>
            </div>

            {/* Right half */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">IOF</span>
                  <span className="text-xs font-bold text-[#005c46]">R$ 0,00</span>
                </div>
                <Select value={tipoIof} onChange={e => setTipoIof(e.target.value)}>
                  <option value="normal">Normal (Regras)</option>
                  <option value="isenta">Isenta</option>
                  <option value="especifica">Específica</option>
                </Select>
                {tipoIof === "especifica" && (
                  <Field label="Valor IOF (%)">
                    <Input type="number" defaultValue="0" step="0.01" />
                  </Field>
                )}
              </div>
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <SwitchField label="Cota Capital" checked={chkCota} onChange={setChkCota} value="R$ 0,00" />
                {chkCota && <Input type="text" defaultValue="0,00" />}
              </div>
              <div className="space-y-2">
                <SwitchField label="Outras Custas" checked={chkCustas} onChange={setChkCustas} value="R$ 0,00" />
                {chkCustas && <Input type="text" defaultValue="0,00" />}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right sidebar */}
      <div className="col-span-4 space-y-4" style={{ position: "sticky", top: 20, alignSelf: "start" }}>
        {/* Resumo */}
        <Card accent="green">
          <h3 className="text-center font-bold text-[#005c46] text-sm uppercase tracking-wider mb-3"
            style={{ fontFamily: "'Roboto Slab', serif" }}>
            Resumo da Operação
          </h3>
          <ul>
            <ResumoItem label="Valor Financiado" value="R$ 0,00" />
            <ResumoItem label="TAC" value="R$ 0,00" type="danger" />
            <ResumoItem label="IOF" value="R$ 0,00" type="danger" />
            <ResumoItem label="Seguro Prestamista" value="R$ 0,00" type="danger" />
            <ResumoItem label="Cota Capital" value="R$ 0,00" type="danger" />
            <ResumoItem label="Outras Custas" value="R$ 0,00" type="danger" />
          </ul>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center bg-orange-50 border-b-2 border-[#f58220] rounded-lg px-3 py-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total de Custas</span>
              <span className="text-sm font-bold text-red-500">R$ 0,00</span>
            </div>
            <div className="flex justify-between items-center bg-[#005c46]/5 border-b-2 border-[#005c46] rounded-lg px-3 py-2">
              <span className="text-xs font-bold text-[#005c46] uppercase tracking-wide">Valor Líquido</span>
              <span className="text-sm font-bold text-[#005c46]">R$ 0,00</span>
            </div>
          </div>
        </Card>

        {/* Taxa */}
        <Card className="border-2 border-[#005c46] bg-[#005c46]/5">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#005c46] mb-1">Taxa Sugerida</p>
            <p className="text-3xl font-black text-[#005c46] mb-1">—</p>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Taxa Mínima (Score)</p>
            <p className="text-base font-bold text-gray-500 mb-3">—</p>
            <div className="border-t border-[#005c46]/15 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Taxa Efetiva Fechada (% a.m.)</p>
              <input
                type="text"
                placeholder="0,00%"
                className="w-full rounded-lg border-2 border-[#005c46] bg-white px-3 py-2 text-center text-base font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005c46]/30 transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-2">Sistema de Amortização: —</p>
            </div>
          </div>
        </Card>

        <button className="w-full bg-[#f58220] hover:bg-[#d97018] text-white font-bold py-3 rounded-xl shadow-md text-sm tracking-wide flex items-center justify-center gap-2 transition-colors">
          <BarChart2 size={16} />
          Simular
        </button>
      </div>
    </div>
  );
}

// ── Especiais screen ──────────────────────────────────────────────────────────

function EspeciaisScreen() {
  const [sub, setSub] = useState<SubEspecial>("lotePrazos");

  const subs = [
    { id: "lotePrazos" as SubEspecial, label: "Lote por Prazos", icon: BarChart2 },
    { id: "loteModalidades" as SubEspecial, label: "Lote por Modalidades", icon: TrendingUp },
    { id: "composta" as SubEspecial, label: "Simulação Composta", icon: FileText },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {subs.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSub(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                sub === s.id
                  ? "bg-[#f58220] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#005c46]/30"
              }`}
            >
              <Icon size={14} />
              {s.label}
            </button>
          );
        })}
      </div>

      {sub === "lotePrazos" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5">
            <Card accent="orange" className="opacity-50 pointer-events-none">
              <SectionTitle>Parâmetros — Lote por Prazos</SectionTitle>
              <p className="text-xs text-gray-400 mb-4">Simule o mesmo crédito em múltiplos prazos mensais e compare as condições lado a lado.</p>
              <div className="space-y-3">
                <Field label="Modalidade de Financiamento">
                  <div className="flex">
                    <Input readOnly placeholder="Selecione uma modalidade mensal..." className="rounded-r-none bg-gray-50" />
                    <button className="px-3 text-xs font-semibold border border-l-0 border-gray-200 rounded-r-lg text-gray-500">Consultar</button>
                  </div>
                </Field>
                <Field label="Valor de Referência (Bruto)">
                  <ToggleGroup
                    options={[{ value: "bruto", label: "Pelo Bruto" }, { value: "liquido", label: "Pelo Líquido" }]}
                    value="bruto"
                    onChange={() => {}}
                  />
                  <input type="text" defaultValue="0,00" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-bold text-[#005c46] text-lg focus:outline-none" />
                </Field>
                <Field label="Data 1º Vencimento">
                  <Input type="date" />
                </Field>
                <Field label="Selecione os Prazos Desejados">
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {[12, 24, 36, 48, 60, 72, 84].map(p => (
                      <button key={p} className="px-3 py-1 rounded-full text-xs font-semibold border border-[#005c46]/20 text-[#005c46] bg-[#005c46]/5 hover:bg-[#005c46] hover:text-white transition-colors">
                        {p}x
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </Card>
          </div>
          <div className="col-span-7">
            <Card>
              <SectionTitle>Resultado Comparativo</SectionTitle>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart2 size={40} className="text-gray-200 mb-3" />
                <p className="text-sm font-semibold text-gray-400">Preencha os parâmetros e selecione os prazos para gerar a comparação</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {sub === "loteModalidades" && (
        <Card>
          <SectionTitle>Lote por Modalidades</SectionTitle>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingUp size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-400">Selecione um associado para liberar esta tela</p>
          </div>
        </Card>
      )}

      {sub === "composta" && (
        <Card>
          <SectionTitle>Simulação Composta</SectionTitle>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-400">Selecione um associado para liberar esta tela</p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Historico screen ──────────────────────────────────────────────────────────

const mockHistorico = [
  { id: 1, associado: "João Pereira da Silva", conta: "12345", modalidade: "CDC Pessoal", valor: "R$ 25.000,00", prazo: "36x", taxa: "1,45%", data: "15/07/2026", status: "Aprovado" },
  { id: 2, associado: "Maria José Oliveira", conta: "67890", modalidade: "Crédito Rural", valor: "R$ 80.000,00", prazo: "60x", taxa: "0,98%", data: "14/07/2026", status: "Aprovado" },
  { id: 3, associado: "Carlos Eduardo Neto", conta: "11223", modalidade: "Custeio Agrícola", valor: "R$ 45.000,00", prazo: "12x", taxa: "0,75%", data: "14/07/2026", status: "Pendente" },
  { id: 4, associado: "Ana Paula Costa", conta: "44556", modalidade: "CDC Pessoal", valor: "R$ 15.000,00", prazo: "24x", taxa: "1,60%", data: "13/07/2026", status: "Recusado" },
  { id: 5, associado: "Roberto Alves Mendes", conta: "77889", modalidade: "Investimento Rural", valor: "R$ 120.000,00", prazo: "84x", taxa: "0,89%", data: "12/07/2026", status: "Aprovado" },
];

function HistoricoScreen() {
  const statusStyle = (s: string) => {
    if (s === "Aprovado") return "bg-green-50 text-green-700 border border-green-200";
    if (s === "Pendente") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-red-50 text-red-600 border border-red-200";
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Histórico de Simulações</SectionTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Pesquisar..." className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005c46]/20" />
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#005c46] text-white">
              {["Conta", "Associado", "Modalidade", "Valor", "Prazo", "Taxa", "Data", "Status", ""].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold tracking-wide text-[10px] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockHistorico.map((row, i) => (
              <tr key={row.id} className={`border-b border-gray-50 hover:bg-[#005c46]/3 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                <td className="px-3 py-2.5 font-mono text-gray-500">{row.conta}</td>
                <td className="px-3 py-2.5 font-semibold text-gray-700">{row.associado}</td>
                <td className="px-3 py-2.5 text-gray-600">{row.modalidade}</td>
                <td className="px-3 py-2.5 font-bold text-[#005c46]">{row.valor}</td>
                <td className="px-3 py-2.5 text-gray-600">{row.prazo}</td>
                <td className="px-3 py-2.5 text-gray-600">{row.taxa}</td>
                <td className="px-3 py-2.5 text-gray-400">{row.data}</td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle(row.status)}`}>{row.status}</span>
                </td>
                <td className="px-3 py-2.5">
                  <button className="text-gray-300 hover:text-[#005c46] transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3 text-right">Exibindo {mockHistorico.length} registros</p>
    </Card>
  );
}

// ── Dashboard screen ──────────────────────────────────────────────────────────

function DashboardScreen() {
  const kpis = [
    { label: "Simulações Hoje", value: "47", icon: FileText, delta: "+12%" },
    { label: "Volume Simulado", value: "R$ 2,4M", icon: DollarSign, delta: "+8%" },
    { label: "Taxa Média", value: "1,23% a.m.", icon: Percent, delta: "-0,05%" },
    { label: "Taxa Aprovação", value: "78%", icon: Shield, delta: "+3%" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          const isPositive = k.delta.startsWith("+");
          return (
            <Card key={k.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">{k.label}</p>
                  <p className="text-xl font-black text-gray-800" style={{ fontFamily: "'Roboto Slab', serif" }}>{k.value}</p>
                  <span className={`text-xs font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>{k.delta} vs. ontem</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#005c46]/8 flex items-center justify-center">
                  <Icon size={16} className="text-[#005c46]" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card>
        <SectionTitle>Atividade Recente — Simulações por Hora</SectionTitle>
        <div className="flex items-end gap-1.5 h-28 mt-2">
          {[4, 7, 3, 9, 12, 8, 6, 10, 14, 11, 7, 5, 9, 13, 8, 6, 4, 3].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full rounded-t bg-[#005c46] opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ height: `${(v / 14) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-gray-300 mt-1 font-mono">
          <span>06h</span><span>09h</span><span>12h</span><span>15h</span><span>18h</span><span>21h</span>
        </div>
      </Card>
    </div>
  );
}

// ── Admin screen ──────────────────────────────────────────────────────────────

function AdminScreen() {
  return (
    <Card>
      <SectionTitle>Painel Administrativo</SectionTitle>
      <div className="flex flex-col items-center justify-center py-16">
        <Settings size={40} className="text-gray-200 mb-3" />
        <p className="text-sm font-semibold text-gray-400">Painel de administração — em desenvolvimento</p>
      </div>
    </Card>
  );
}

// ── Main header ───────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>📅 Última atualização:</span>
        <Badge variant="gray">Associados: 16/07/2026</Badge>
        <Badge variant="gray">Modalidades: 15/07/2026</Badge>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-[#f58220]/10 border border-[#f58220]/20 rounded-full px-3 py-1 cursor-pointer hover:bg-[#f58220]/15 transition-colors">
          <span className="text-[10px] font-bold text-[#f58220] uppercase tracking-wide">Novidade</span>
          <span className="text-xs text-[#005c46] font-semibold">Nova modalidade Crédito Verde disponível</span>
          <span className="text-[#f58220] text-xs font-bold">→</span>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("simulador");
  const [isAdmin] = useState(true);
  const [associadoSelecionado, setAssociadoSelecionado] = useState(false);

  const tabTitles: Record<Tab, string> = {
    simulador: "Simulação Simples",
    especial: "Simulações Especiais",
    historico: "Histórico de Simulações",
    dashboard: "Dashboard",
    admin: "Painel Admin",
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Roboto', sans-serif", backgroundColor: "#e8ecf0" }}>
      <Sidebar active={activeTab} onNav={setActiveTab} isAdmin={isAdmin} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-5">
          {/* Page header */}
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-lg font-black text-[#005c46]" style={{ fontFamily: "'Roboto Slab', serif" }}>
              {tabTitles[activeTab]}
            </h1>
            {activeTab === "simulador" && <Badge variant="orange">2026</Badge>}
          </div>

          {/* Associate block — shown on simulator + especial */}
          {(activeTab === "simulador" || activeTab === "especial") && (
            <AssociateBlock />
          )}

          {/* Content */}
          {activeTab === "simulador" && <SimuladorScreen locked={!associadoSelecionado} />}
          {activeTab === "especial" && <EspeciaisScreen />}
          {activeTab === "historico" && <HistoricoScreen />}
          {activeTab === "dashboard" && <DashboardScreen />}
          {activeTab === "admin" && <AdminScreen />}
        </main>
      </div>
    </div>
  );
}
