import { useState, useEffect } from "react";
import { Calendar, Shirt, ShoppingBag, AlertCircle, TrendingUp, FileText, Bell } from "lucide-react";
import { Link } from "react-router";
import { getUtilizadorAtual } from "../lib/auth";
import { getReservas, getMinhasReservas, getOcorrencias, getMinhasOcorrencias, getMarketplace, getMarketplaceGestao, getMarketplaceDoUtilizador, getAnunciosEscola } from "../lib/services";
import type { LinhaReserva } from "../lib/dados-mock";

interface NotificacaoDashboard {
  chave: string;
  mensagem: string;
  lida: boolean;
}

const DASHBOARD_NOTIF_KEY = "fighappens_notificacoes_vistas";

export function Dashboard() {
  const utilizadorAtual = getUtilizadorAtual();

  const [reservasAtivas, setReservasAtivas] = useState(0);
  const [figurinosDisponiveis, setFigurinosDisponiveis] = useState(0);
  const [ocorrenciasPendentes, setOcorrenciasPendentes] = useState(0);
  const [anunciosPendentes, setAnunciosPendentes] = useState(0);
  const [totalMarketplace, setTotalMarketplace] = useState(0);
  const [proximasReservas, setProximasReservas] = useState<LinhaReserva[]>([]);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoDashboard[]>([]);

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

  const marcarComoLida = (chave: string) => {
    const vistas = obterChavesVistas();
    if (!vistas.includes(chave)) {
      guardarChavesVistas([...vistas, chave]);
    }
    setNotificacoes((prev) => prev.map((n) => (n.chave === chave ? { ...n, lida: true } : n)));
  };

  useEffect(() => {
    getAnunciosEscola().then(anuncios => {
      setFigurinosDisponiveis(anuncios.filter(a => a.estado_anuncio?.nome === 'Disponível').length);
    });

    if (utilizadorAtual?.tipo === 'funcionario') {
      getReservas().then(reservas => {
        const ativas = reservas.filter(r => {
          const e = r.estado?.toUpperCase();
          return e === 'CONFIRMADA' || e === 'EM CURSO';
        });
        setReservasAtivas(ativas.length);
      });
      getOcorrencias().then(ocs => {
        setOcorrenciasPendentes(ocs.filter(o => {
          const e = o.estado?.toLowerCase();
          return e === 'a aguardar' || e === 'a aguardar orçamento';
        }).length);
      });
      getMarketplaceGestao().then(anuncios => {
        setTotalMarketplace(anuncios.length);
        setAnunciosPendentes(anuncios.filter(a => a.estado === 'Pendente').length);
      });
    } else {
      getMinhasReservas().then(reservas => {
        const ativas = reservas.filter(r => {
          const e = r.estado?.toUpperCase();
          return e === 'CONFIRMADA' || e === 'EM CURSO';
        });
        setReservasAtivas(ativas.length);
        const proximas = reservas
          .filter(r => r.estado?.toUpperCase() === 'CONFIRMADA')
          .flatMap(r => r.linhas)
          .slice(0, 3);
        setProximasReservas(proximas);
      });
      getMinhasOcorrencias().then(ocs => {
        setOcorrenciasPendentes(ocs.filter(o => {
          const e = o.estado?.toLowerCase();
          return e === 'a aguardar' || e === 'a aguardar orçamento';
        }).length);
      });
      getMarketplace().then(anuncios => {
        setTotalMarketplace(anuncios.length);
      });

      if (utilizadorAtual?.id) {
        getMarketplaceDoUtilizador(utilizadorAtual.id).then((anuncios) => {
          const vistas = obterChavesVistas();
          const notificacoesGeradas = anuncios
            .map((a) => {
              const estado = (a.estado || "").toLowerCase();
              const dataRef = a.data_aprovacao || a.data_anuncio || "";
              const chave = `${a.id}:${estado}:${dataRef}`;

              if (estado === "aprovado" || estado === "publicado") {
                return {
                  chave,
                  mensagem: `O seu anúncio "${a.titulo}" foi aprovado.`,
                  lida: vistas.includes(chave),
                };
              }

              if (estado === "rejeitado" || estado === "reprovado") {
                return {
                  chave,
                  mensagem: `O seu anúncio "${a.titulo}" foi rejeitado. Tem 3 dias para ressubmeter o anúncio.`,
                  lida: vistas.includes(chave),
                };
              }

              return null;
            })
            .filter((n): n is NotificacaoDashboard => n !== null);

          setNotificacoes(notificacoesGeradas);
        });
      }
    }
  }, [utilizadorAtual?.tipo]);

  const notificacoesNaoLidas = notificacoes.filter((n) => !n.lida).length;

  const estatisticas = [
    {
      nome: "Reservas Ativas",
      valor: reservasAtivas,
      icon: Calendar,
      cor: "bg-blue-500",
      link: "/reservas",
    },
    {
      nome: "Figurinos Disponíveis",
      valor: figurinosDisponiveis,
      icon: Shirt,
      cor: "bg-green-500",
      link: "/figurinos",
    },
    {
      nome: "Marketplace",
      valor: totalMarketplace,
      icon: ShoppingBag,
      cor: "bg-purple-500",
      link: "/marketplace",
    },
    {
      nome: "Ocorrências Pendentes",
      valor: ocorrenciasPendentes,
      icon: AlertCircle,
      cor: "bg-orange-500",
      link: "/ocorrencias",
    },
  ];


  return (
    <div className="space-y-8">
      {/* Secção de Boas-Vindas */}
      <div className="bg-gradient-to-r from-fig-purple via-fig-dark to-fig-magenta rounded-2xl p-8 text-white relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo{utilizadorAtual?.tipo === 'funcionario' && 'a'} ao FigHappens, {utilizadorAtual?.nome.split(' ')[0]}! 👋
            </h1>
            {utilizadorAtual?.tipo === 'aluno' && (
              <p className="text-fig-green-light text-lg">
                Explore o catálogo e faça as suas reservas de figurinos.
              </p>
            )}
          </div>

          {utilizadorAtual?.tipo === 'aluno' && (
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
              {utilizadorAtual?.tipo === 'funcionario' ? 'Alertas' : 'Próximas Reservas'}
            </h2>
            {utilizadorAtual?.tipo === 'funcionario' ? (
              <AlertCircle className="w-5 h-5 text-orange-500" />
            ) : (
              <Calendar className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="space-y-4">
            {utilizadorAtual?.tipo === 'funcionario' ? (
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
                          {anunciosPendentes} anúncio{anunciosPendentes !== 1 ? 's' : ''} pendente{anunciosPendentes !== 1 ? 's' : ''}
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
                          {ocorrenciasPendentes} ocorrência{ocorrenciasPendentes !== 1 ? 's' : ''} em análise
                        </p>
                        <p className="text-xs text-orange-700">Requer atenção</p>
                      </div>
                    </div>
                  </Link>
                )}
                {anunciosPendentes === 0 && ocorrenciasPendentes === 0 && (
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
                        <p className="font-medium text-gray-900 truncate">
                          {linha.anuncio.figurino.nome}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(linha.data_inicio).toLocaleDateString('pt-PT')} - {new Date(linha.data_fim).toLocaleDateString('pt-PT')}
                        </p>
                        <p className="text-sm text-purple-600 mt-1">
                          €{linha.valor_diario}/dia
                        </p>
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
      {utilizadorAtual?.tipo === 'aluno' && (
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
