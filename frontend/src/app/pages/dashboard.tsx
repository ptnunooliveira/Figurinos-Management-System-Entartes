import { useState } from "react";
import { Calendar, Shirt, ShoppingBag, AlertCircle, Bell, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { getUtilizadorAtual } from "../lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getReservas, getMinhasReservas, getOcorrencias, getMarketplace, getMarketplaceGestao, getAnunciosEscola, getMarketplaceDoUtilizador, getPropostasCobranca, getMinhasOcorrencias } from "../lib/services";
import type { LinhaReserva } from "../lib/dados-mock";

interface NotificacaoDashboard {
  chave: string;
  mensagem: string;
  lida: boolean;
}

const DASHBOARD_NOTIF_KEY = "fighappens_notificacoes_vistas";
const MARKETPLACE_INTERESSE_NOTIF_KEY = "fighappens_marketplace_interesses";
const DASHBOARD_NOTIF_REMOVIDAS_KEY = "fighappens_notificacoes_removidas";

export function Dashboard() {
  const utilizadorAtual = getUtilizadorAtual();
  const isFuncionario = utilizadorAtual?.tipo === "funcionario";

  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [notificacoesExtra, setNotificacoesExtra] = useState<NotificacaoDashboard[]>([]);
  const [notificacoesInteresse, setNotificacoesInteresse] = useState<NotificacaoDashboard[]>([]);

  const obterChavesVistas = (): string[] => {
    try {
      const raw = localStorage.getItem(DASHBOARD_NOTIF_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const guardarChavesVistas = (chaves: string[]) => {
    localStorage.setItem(DASHBOARD_NOTIF_KEY, JSON.stringify(chaves));
  };

  const obterChavesRemovidas = (): string[] => {
    try {
      const raw = localStorage.getItem(DASHBOARD_NOTIF_REMOVIDAS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const guardarChavesRemovidas = (chaves: string[]) => {
    localStorage.setItem(DASHBOARD_NOTIF_REMOVIDAS_KEY, JSON.stringify(chaves));
  };

  const marcarComoLida = (chave: string) => {
    const vistas = obterChavesVistas();
    if (!vistas.includes(chave)) {
      guardarChavesVistas([...vistas, chave]);
    }
    setNotificacoesExtra((prev) => prev.map((n) => (n.chave === chave ? { ...n, lida: true } : n)));
    setNotificacoesInteresse((prev) => prev.map((n) => (n.chave === chave ? { ...n, lida: true } : n)));
  };

  const eliminarNotificacao = (chave: string) => {
    const removidas = obterChavesRemovidas();
    if (!removidas.includes(chave)) {
      guardarChavesRemovidas([...removidas, chave]);
    }
    setNotificacoesExtra((prev) => prev.filter((n) => n.chave !== chave));
    setNotificacoesInteresse((prev) => prev.filter((n) => n.chave !== chave));
    try {
      const raw = localStorage.getItem(MARKETPLACE_INTERESSE_NOTIF_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const lista = Array.isArray(parsed) ? parsed : [];
      const atualizada = lista.filter((item: any) => String(item?.chave ?? "") !== chave);
      localStorage.setItem(MARKETPLACE_INTERESSE_NOTIF_KEY, JSON.stringify(atualizada));
    } catch {
      // noop
    }
  };

  // --- Queries ---

  const { data: anunciosEscola = [] } = useQuery({
    queryKey: ["anunciosEscola"],
    queryFn: getAnunciosEscola,
  });

  const { data: reservasFuncionario = [] } = useQuery({
    queryKey: ["reservas"],
    queryFn: getReservas,
    enabled: isFuncionario,
  });

  const { data: minhasReservas = [] } = useQuery({
    queryKey: ["minhasReservas"],
    queryFn: getMinhasReservas,
    enabled: !isFuncionario,
  });

  const { data: ocorrencias = [] } = useQuery({
    queryKey: ["ocorrencias"],
    queryFn: getOcorrencias,
    enabled: isFuncionario,
  });

  const { data: minhasOcorrencias = [] } = useQuery({
    queryKey: ["minhasOcorrencias"],
    queryFn: getMinhasOcorrencias,
    enabled: !isFuncionario,
  });

  const { data: marketplaceGestao = [] } = useQuery({
    queryKey: ["marketplaceGestao"],
    queryFn: getMarketplaceGestao,
    enabled: isFuncionario,
  });

  const { data: propostas = [] } = useQuery({
    queryKey: ["propostasCobranca"],
    queryFn: getPropostasCobranca,
    enabled: isFuncionario,
  });

  const { data: marketplace = [] } = useQuery({
    queryKey: ["marketplace"],
    queryFn: getMarketplace,
    enabled: !isFuncionario,
  });

  useQuery({
    queryKey: ["marketplaceDoUtilizador", utilizadorAtual?.id],
    queryFn: () => getMarketplaceDoUtilizador(utilizadorAtual!.id),
    enabled: !isFuncionario && !!utilizadorAtual?.id,
    select: (anuncios) => {
      const vistas = obterChavesVistas();
      const removidas = obterChavesRemovidas();

      const interesse: NotificacaoDashboard[] = (() => {
        try {
          const raw = localStorage.getItem(MARKETPLACE_INTERESSE_NOTIF_KEY);
          if (!raw) return [];
          const parsed = JSON.parse(raw);
          const lista = Array.isArray(parsed) ? parsed : [];
          return lista
            .filter((item: any) => Number(item?.idDono) === utilizadorAtual!.id && typeof item?.mensagem === "string")
            .filter((item: any) => !removidas.includes(String(item.chave ?? `interesse:${item.idAnuncio}:${item.idInteressado}`)))
            .map((item: any) => ({
              chave: String(item.chave ?? `interesse:${item.idAnuncio}:${item.idInteressado}`),
              mensagem: item.mensagem,
              lida: vistas.includes(String(item.chave ?? `interesse:${item.idAnuncio}:${item.idInteressado}`)),
            }));
        } catch {
          return [];
        }
      })();

      const geradas = anuncios
        .map((a) => {
          const estado = (a.estado || "").toLowerCase();
          const dataRef = a.data_aprovacao || a.data_anuncio || "";
          const chave = `${a.id}:${estado}:${dataRef}`;
          if (estado === "aprovado" || estado === "publicado") {
            return { chave, mensagem: `O seu anúncio "${a.titulo}" foi aprovado.`, lida: vistas.includes(chave) };
          }
          if (estado === "rejeitado" || estado === "reprovado") {
            return { chave, mensagem: `O seu anúncio "${a.titulo}" foi rejeitado. Tem 3 dias para ressubmeter o anúncio.`, lida: vistas.includes(chave) };
          }
          return null;
        })
        .filter((n): n is NotificacaoDashboard => n !== null)
        .filter((n) => !removidas.includes(n.chave));

      setNotificacoesInteresse(interesse);
      setNotificacoesExtra(geradas);
      return anuncios;
    },
  });

  // --- Derived counts ---

  const figurinosDisponiveis = anunciosEscola.filter(
    (a) => a.estado_anuncio?.nome === "Disponível"
  ).length;

  const reservasAtivas = isFuncionario
    ? reservasFuncionario.filter((r) => {
        const e = r.estado?.toUpperCase();
        return e === "CONFIRMADA" || e === "EM CURSO";
      }).length
    : minhasReservas.filter((r) => {
        const e = r.estado?.toUpperCase();
        return e === "CONFIRMADA" || e === "EM CURSO";
      }).length;

  const proximasReservas: LinhaReserva[] = isFuncionario
    ? []
    : minhasReservas
        .filter((r) => r.estado?.toUpperCase() === "CONFIRMADA")
        .flatMap((r) => r.linhas)
        .slice(0, 3);

  const ocorrenciasPendentes = isFuncionario
    ? ocorrencias.filter((o) => {
        const e = o.estado?.toLowerCase();
        return e === "em análise" || e === "pendente" || e === "a aguardar" || e === "a aguardar orçamento";
      }).length
    : minhasOcorrencias.filter((o) => {
        const e = o.estado?.toLowerCase();
        return e === "a aguardar" || e === "a aguardar orçamento";
      }).length;

  const anunciosPendentes = marketplaceGestao.filter((a) => {
    const estado = (a.estado || "").toLowerCase();
    return estado === "submetido" || estado === "pendente";
  }).length;

  const propostasPendentes = propostas.filter((p) => {
    const estado = (p.estado || "").toLowerCase();
    return estado !== "aceite" && estado !== "rejeitada" && estado !== "finalizada";
  }).length;

  const totalMarketplace = isFuncionario ? marketplaceGestao.length : marketplace.length;

  // --- Notificações funcionário ---
  const notificacoesFuncionario: NotificacaoDashboard[] = isFuncionario
    ? (() => {
        const vistas = obterChavesVistas();
        const result: NotificacaoDashboard[] = [];
        if (anunciosPendentes > 0) {
          const chave = `admin:anuncios:${anunciosPendentes}`;
          result.push({ chave, mensagem: `Tem ${anunciosPendentes} anúncio${anunciosPendentes !== 1 ? "s" : ""} para responder.`, lida: vistas.includes(chave) });
        }
        if (ocorrenciasPendentes > 0) {
          const chave = `admin:ocorrencias:${ocorrenciasPendentes}`;
          result.push({ chave, mensagem: `Tem ${ocorrenciasPendentes} ocorrência${ocorrenciasPendentes !== 1 ? "s" : ""} para analisar.`, lida: vistas.includes(chave) });
        }
        if (propostasPendentes > 0) {
          const chave = `admin:propostas:${propostasPendentes}`;
          result.push({ chave, mensagem: `Tem ${propostasPendentes} proposta${propostasPendentes !== 1 ? "s" : ""} para responder.`, lida: vistas.includes(chave) });
        }
        return result;
      })()
    : [];

  const notificacoes: NotificacaoDashboard[] = isFuncionario
    ? notificacoesFuncionario
    : [...notificacoesInteresse, ...notificacoesExtra];

  const notificacoesNaoLidas = notificacoes.filter((n) => !n.lida).length;

  const estatisticas = [
    { nome: "Reservas Ativas", valor: reservasAtivas, icon: Calendar, cor: "bg-blue-500", link: "/reservas" },
    { nome: "Figurinos Disponíveis", valor: figurinosDisponiveis, icon: Shirt, cor: "bg-green-500", link: "/figurinos" },
    { nome: "Marketplace", valor: totalMarketplace, icon: ShoppingBag, cor: "bg-purple-500", link: "/marketplace" },
    { nome: "Ocorrências Pendentes", valor: ocorrenciasPendentes, icon: AlertCircle, cor: "bg-orange-500", link: "/ocorrencias" },
  ];

  return (
    <div className="space-y-8">
      {/* Secção de Boas-Vindas */}
      <div className="bg-gradient-to-r from-fig-purple via-fig-dark to-fig-magenta rounded-2xl p-8 text-white relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo ao FigHappens, {utilizadorAtual?.nome.split(" ")[0]}! 👋
            </h1>
            {utilizadorAtual?.tipo === "aluno" && (
              <p className="text-fig-green-light text-lg">
                Explore o catálogo e faça as suas reservas de figurinos.
              </p>
            )}
          </div>

          {!!utilizadorAtual && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMostrarNotificacoes((v) => !v)}
                className="relative p-3 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
                aria-label="Notificações"
              >
                <Bell className="w-6 h-6 text-white" />
                {notificacoesNaoLidas > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {notificacoesNaoLidas}
                  </span>
                )}
              </button>

              {mostrarNotificacoes && (
                <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white text-gray-900 rounded-xl shadow-xl border z-20">
                  <div className="p-4 border-b">
                    <p className="font-semibold">Notificações</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notificacoes.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500">Sem notificações.</p>
                    ) : (
                      notificacoes.map((n) => (
                        <div key={n.chave} className="p-4 border-b last:border-b-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={`text-sm ${n.lida ? "text-gray-500" : "text-gray-900 font-medium"}`}>{n.mensagem}</p>
                              {!n.lida && (
                                <button
                                  type="button"
                                  onClick={() => marcarComoLida(n.chave)}
                                  className="mt-2 text-xs text-fig-purple hover:underline"
                                >
                                  Marcar como lida
                                </button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarNotificacao(n.chave)}
                              className="mt-1 text-gray-400 hover:text-red-600 transition-colors"
                              aria-label="Eliminar notificação"
                              title="Eliminar notificação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grelha de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {estatisticas.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.nome}
              to={stat.link}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.nome}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.valor}</p>
                </div>
                <div className={`${stat.cor} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Próximas Reservas ou Alertas */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isFuncionario ? "Alertas" : "Próximas Reservas"}
            </h2>
            {isFuncionario ? (
              <AlertCircle className="w-5 h-5 text-orange-500" />
            ) : (
              <Calendar className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="space-y-4">
            {isFuncionario ? (
              <>
                {anunciosPendentes > 0 && (
                  <Link
                    to="/administracao"
                    className="block p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <ShoppingBag className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">
                          {anunciosPendentes} anúncio{anunciosPendentes !== 1 ? "s" : ""} pendente{anunciosPendentes !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-yellow-700">Clique para aprovar ou rejeitar</p>
                      </div>
                    </div>
                  </Link>
                )}
                {ocorrenciasPendentes > 0 && (
                  <Link
                    to="/ocorrencias"
                    className="block p-4 bg-orange-50 border-l-4 border-orange-500 rounded hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">
                          {ocorrenciasPendentes} ocorrência{ocorrenciasPendentes !== 1 ? "s" : ""} em análise
                        </p>
                        <p className="text-xs text-orange-700">Requer atenção</p>
                      </div>
                    </div>
                  </Link>
                )}
                {anunciosPendentes === 0 && ocorrenciasPendentes === 0 && propostasPendentes === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                    <p className="text-sm">Tudo em ordem! 🎉</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {proximasReservas.length > 0 ? (
                  proximasReservas.map((linha) => (
                    <div key={linha.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shirt className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{linha.anuncio.figurino.nome}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(linha.data_inicio).toLocaleDateString("pt-PT")} -{" "}
                          {new Date(linha.data_fim).toLocaleDateString("pt-PT")}
                        </p>
                        <p className="text-sm text-purple-600 mt-1">€{linha.valor_diario}/dia</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Nenhuma reserva próxima</p>
                    <Link to="/figurinos" className="text-purple-600 hover:text-purple-700 text-sm mt-2 inline-block">
                      Ver figurinos disponíveis
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      {utilizadorAtual?.tipo === "aluno" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/figurinos"
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <Shirt className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Explorar Figurinos</p>
                <p className="text-sm text-gray-500">Ver catálogo completo</p>
              </div>
            </Link>
            <Link
              to="/reservas"
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <Calendar className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Minhas Reservas</p>
                <p className="text-sm text-gray-500">Ver histórico</p>
              </div>
            </Link>
            <Link
              to="/marketplace"
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <ShoppingBag className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Marketplace</p>
                <p className="text-sm text-gray-500">Anunciar figurino</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
