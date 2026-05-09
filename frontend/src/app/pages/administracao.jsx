import { useState, useEffect, useMemo } from "react";
import { UserPlus, Eye, EyeOff, Tag, Layers, Plus, Check, ShieldCheck, ShieldOff, Search } from "lucide-react";
import {
  criarUtilizador,
  getCategorias,
  getTiposFigurino,
  criarCategoria,
  criarTipoFigurino,
  getUtilizadoresAdmin,
  desativarUtilizador,
  ativarUtilizador
} from "../lib/services";
import { getUtilizadorAtual } from "../lib/auth";
import { toast } from "sonner";

// ------------------------------------------------------------
// Painel reutilizavel para listas auxiliares (categorias / tipos)
// ------------------------------------------------------------
function PainelGestao({
  titulo,
  icone: Icone,
  itens,
  placeholder,
  onCriar
}) {
  const [nome, setNome] = useState("");
  const [aCriar, setACriar] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const nomeTrimmed = nome.trim();
    if (!nomeTrimmed || aCriar) return;
    setACriar(true);
    try {
      await onCriar(nomeTrimmed);
      setNome("");
    } finally {
      setACriar(false);
    }
  };
  return <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-fig-purple to-fig-magenta rounded-lg flex items-center justify-center">
          <Icone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
          <p className="text-sm text-gray-500">{itens.length} existente{itens.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Lista de itens existentes */}
      {itens.length > 0 && <div className="mb-4 max-h-40 overflow-y-auto space-y-1">
          {itens.map((item) => <div
    key={item.id}
    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700"
  >
              <Check className="w-3.5 h-3.5 text-fig-purple shrink-0" />
              {item.nome}
            </div>)}
        </div>}

      {/* Formulario para criar novo */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
    type="text"
    value={nome}
    onChange={(e) => setNome(e.target.value)}
    placeholder={placeholder}
    className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fig-purple focus:border-transparent"
  />
        <button
    type="submit"
    disabled={aCriar || !nome.trim()}
    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
          <Plus className="w-4 h-4" />
          {aCriar ? "A criar..." : "Criar"}
        </button>
      </form>
    </div>;
}


// ------------------------------------------------------------
// Caixa de gestao de acessos:
//  - Lista todos os utilizadores (qualquer perfil, ativos e suspensos).
//  - ADMIN pode alternar o estado de qualquer utilizador (excepto
//    a propria conta).
//  - FUNCIONARIO so pode alternar o estado de utilizadores com
//    perfil ALUNO; sobre FUNCIONARIO/ADMIN o botao fica desativado.
//  - A suspensao tem efeito imediato no proximo pedido autenticado
//    porque o backend (authMiddleware) revalida o flag "ativo" na BD.
// ------------------------------------------------------------
function GestaoAcessos({ idUtilizadorAtual, perfilUtilizadorAtual }) {
  const [utilizadores, setUtilizadores] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [pesquisa, setPesquisa] = useState("");
  // Identificadores em curso, para desativar so o botao do utilizador
  // que esta a ser alterado e nao a lista inteira.
  const [idsEmCurso, setIdsEmCurso] = useState([]);

  const carregarUtilizadores = async () => {
    setACarregar(true);
    try {
      const lista = await getUtilizadoresAdmin();
      setUtilizadores(lista);
    } finally {
      setACarregar(false);
    }
  };

  useEffect(() => {
    carregarUtilizadores();
  }, []);

  // Filtragem em memoria por nome/email/perfil
  const utilizadoresFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    if (!termo) return utilizadores;
    return utilizadores.filter((u) => {
      return (
        (u.nome ?? "").toLowerCase().includes(termo) ||
        (u.email ?? "").toLowerCase().includes(termo) ||
        (u.perfil ?? "").toLowerCase().includes(termo)
      );
    });
  }, [utilizadores, pesquisa]);

  // Indica se o utilizador autenticado tem permissao para atuar
  // sobre o registo recebido. Espelha a regra do backend para
  // mantermos um feedback coerente na UI.
  //   - Contas ADMIN nunca podem ser (des)ativadas (regra absoluta).
  //   - ADMIN: pode atuar sobre ALUNOS e FUNCIONARIOS.
  //   - FUNCIONARIO: so pode atuar sobre ALUNOS.
  const podeAtuarSobre = (alvo) => {
    if (alvo.perfil === "ADMIN") return false;
    if (perfilUtilizadorAtual === "ADMIN") return true;
    if (perfilUtilizadorAtual === "FUNCIONARIO") return alvo.perfil === "ALUNO";
    return false;
  };

  // Alternancia ativo <-> suspenso
  const handleAlternarEstado = async (utilizador) => {
    if (idsEmCurso.includes(utilizador.id)) return;

    // Salvaguardas no cliente. O backend tambem bloqueia, mas
    // evitamos chamadas desnecessarias e damos feedback imediato.
    if (utilizador.ativo && Number(utilizador.id) === Number(idUtilizadorAtual)) {
      toast.error("Nao pode desativar a sua propria conta.");
      return;
    }

    if (!podeAtuarSobre(utilizador)) {
      toast.error("Sem permissao para atuar sobre este utilizador.");
      return;
    }

    const accao = utilizador.ativo ? "desativar" : "reativar";
    const confirmar = window.confirm(
      `Tem a certeza que pretende ${accao} o utilizador "${utilizador.nome}"?`
    );
    if (!confirmar) return;

    setIdsEmCurso((prev) => [...prev, utilizador.id]);
    try {
      if (utilizador.ativo) {
        await desativarUtilizador(utilizador.id);
        toast.success(`Utilizador "${utilizador.nome}" desativado.`);
      } else {
        await ativarUtilizador(utilizador.id);
        toast.success(`Utilizador "${utilizador.nome}" reativado.`);
      }
      // Atualiza a lista localmente sem re-fetch para feedback imediato.
      setUtilizadores((prev) =>
        prev.map((u) =>
          u.id === utilizador.id ? { ...u, ativo: !utilizador.ativo } : u
        )
      );
    } catch (err) {
      toast.error(err.message || `Erro ao ${accao} utilizador.`);
    } finally {
      setIdsEmCurso((prev) => prev.filter((id) => id !== utilizador.id));
    }
  };

  return <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-fig-purple to-fig-magenta rounded-lg flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestão de Acessos</h3>
          <p className="text-sm text-gray-500">
            {perfilUtilizadorAtual === "ADMIN"
              ? "Suspender ou reativar utilizadores. A suspensão é imediata."
              : "Suspender ou reativar alunos. A suspensão é imediata."}
          </p>
        </div>
      </div>

      {/* Caixa de pesquisa */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder="Pesquisar por nome, email ou perfil..."
          className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fig-purple focus:border-transparent"
        />
      </div>

      {/* Tabela / lista de utilizadores */}
      {aCarregar ? (
        <p className="text-sm text-gray-500 py-6 text-center">A carregar utilizadores...</p>
      ) : utilizadoresFiltrados.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">
          {pesquisa ? "Sem resultados para a pesquisa." : "Sem utilizadores."}
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
          {utilizadoresFiltrados.map((u) => {
            const ehProprioUtilizador = Number(u.id) === Number(idUtilizadorAtual);
            const emCurso = idsEmCurso.includes(u.id);
            // Para FUNCIONARIO so faz sentido atuar sobre ALUNOS;
            // para ADMIN qualquer perfil esta autorizado.
            const temPermissao = podeAtuarSobre(u);
            const botaoDesativado =
              emCurso ||
              (u.ativo && ehProprioUtilizador) ||
              !temPermissao;
            return (
              <div
                key={u.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.nome}</p>
                    {/* Etiqueta de perfil */}
                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                      {u.perfil}
                    </span>
                    {/* Etiqueta de estado */}
                    {u.ativo ? (
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                        Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        Suspenso
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>

                <button
                  type="button"
                  disabled={botaoDesativado}
                  onClick={() => handleAlternarEstado(u)}
                  title={
                    u.ativo && ehProprioUtilizador
                      ? "Não pode desativar a sua própria conta."
                      : !temPermissao
                        ? u.perfil === "ADMIN"
                          ? "Contas de administrador não podem ser desativadas."
                          : "Apenas administradores podem atuar sobre este perfil."
                        : u.ativo
                          ? "Desativar utilizador"
                          : "Reativar utilizador"
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    u.ativo
                      ? "border border-red-300 text-red-700 hover:bg-red-50"
                      : "border border-green-300 text-green-700 hover:bg-green-50"
                  }`}
                >
                  {u.ativo ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {emCurso ? "..." : u.ativo ? "Desativar" : "Reativar"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>;
}


// ------------------------------------------------------------
// Pagina de Administracao
// ------------------------------------------------------------
function Administracao() {
  const utilizadorAtual = getUtilizadorAtual();
  const isAdmin = utilizadorAtual?.perfil === "ADMIN";
  // FUNCIONARIO tambem pode aceder a caixa de gestao de acessos,
  // mas com permissoes limitadas (so atua sobre ALUNOS).
  const podeGerirAcessos =
    utilizadorAtual?.perfil === "ADMIN" || utilizadorAtual?.perfil === "FUNCIONARIO";
  const perfisDisponiveis = isAdmin ? [
    { value: "ALUNO", label: "Aluno" },
    { value: "FUNCIONARIO", label: "Funcion\xE1rio" }
  ] : [{ value: "ALUNO", label: "Aluno" }];
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perfil, setPerfil] = useState("ALUNO");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [submetendo, setSubmetendo] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [tipos, setTipos] = useState([]);
  useEffect(() => {
    getCategorias().then(setCategorias);
    getTiposFigurino().then(setTipos);
  }, []);
  const limparFormulario = () => {
    setNome("");
    setEmail("");
    setPassword("");
    setPerfil("ALUNO");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submetendo) return;
    if (!nome.trim() || !email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos obrigat\xF3rios");
      return;
    }
    setSubmetendo(true);
    try {
      await criarUtilizador({ nome: nome.trim(), email: email.trim(), password, perfil });
      toast.success(`${perfil === "ALUNO" ? "Aluno" : "Funcion\xE1rio"} criado com sucesso`);
      limparFormulario();
    } catch (err) {
      toast.error(err.message || "Erro ao criar utilizador");
    } finally {
      setSubmetendo(false);
    }
  };
  const handleCriarCategoria = async (nomeCat) => {
    try {
      const nova = await criarCategoria(nomeCat);
      setCategorias(
        (prev) => [...prev, nova].sort((a, b) => a.nome.localeCompare(b.nome))
      );
      toast.success(`Categoria "${nova.nome}" criada com sucesso`);
    } catch (err) {
      toast.error(err.message || "Erro ao criar categoria");
    }
  };
  const handleCriarTipo = async (nomeTipo) => {
    try {
      const novo = await criarTipoFigurino(nomeTipo);
      setTipos(
        (prev) => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome))
      );
      toast.success(`Tipo "${novo.nome}" criado com sucesso`);
    } catch (err) {
      toast.error(err.message || "Erro ao criar tipo de figurino");
    }
  };
  return <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administração</h1>
        <p className="text-gray-600">Gestão de utilizadores e dados do sistema</p>
      </div>

      {/* Criar Utilizador */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Utilizadores</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-fig-purple to-fig-magenta rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Criar Utilizador</h3>
                <p className="text-sm text-gray-500">
                  {isAdmin ? "Crie alunos ou funcion\xE1rios" : "Crie um novo aluno"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin && <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de utilizador
                  </label>
                  <div className="flex gap-3">
                    {perfisDisponiveis.map((p) => <button
    key={p.value}
    type="button"
    onClick={() => setPerfil(p.value)}
    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${perfil === p.value ? "border-fig-purple text-fig-purple bg-fig-purple/5" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
  >
                        {p.label}
                      </button>)}
                  </div>
                </div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <input
    type="text"
    value={nome}
    onChange={(e) => setNome(e.target.value)}
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    placeholder="Ex: Maria Silva"
    required
  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    placeholder="exemplo@escola.pt"
    required
  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
    type={mostrarPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    placeholder="Mínimo 6 caracteres"
    required
  />
                  <button
    type="button"
    onClick={() => setMostrarPassword((v) => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
  >
                    {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
    type="button"
    onClick={limparFormulario}
    disabled={submetendo}
    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
  >
                  Limpar
                </button>
                <button
    type="submit"
    disabled={submetendo}
    className="flex-1 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium"
  >
                  {submetendo ? "A criar..." : `Criar ${perfil === "ALUNO" ? "Aluno" : "Funcion\xE1rio"}`}
                </button>
              </div>
            </form>
          </div>

          {/* Caixa de Gestao de Acessos (visivel para ADMIN e FUNCIONARIO) */}
          {podeGerirAcessos && (
            <GestaoAcessos
              idUtilizadorAtual={utilizadorAtual?.id}
              perfilUtilizadorAtual={utilizadorAtual?.perfil}
            />
          )}
        </div>
      </div>

      {/* Gestao de Figurinos */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados de Figurinos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <PainelGestao
    titulo="Categorias"
    icone={Tag}
    itens={categorias}
    placeholder="Ex: Época Medieval"
    onCriar={handleCriarCategoria}
  />
          <PainelGestao
    titulo="Tipos de Figurino"
    icone={Layers}
    itens={tipos}
    placeholder="Ex: Vestido"
    onCriar={handleCriarTipo}
  />
        </div>
      </div>
    </div>;
}
export {
  Administracao
};
