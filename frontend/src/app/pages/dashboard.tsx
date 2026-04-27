import { useState, useEffect } from "react";
import { Calendar, Shirt, ShoppingBag, AlertCircle, TrendingUp, FileText } from "lucide-react";
import { Link } from "react-router";
import { getUtilizadorAtual } from "../lib/auth";
import { getReservas, getMinhasReservas, getOcorrencias, getMarketplace, getMarketplaceGestao, getAnunciosEscola } from "../lib/services";
import type { LinhaReserva } from "../lib/dados-mock";

export function Dashboard() {
  const utilizadorAtual = getUtilizadorAtual();

  const [reservasAtivas, setReservasAtivas] = useState(0);
  const [figurinosDisponiveis, setFigurinosDisponiveis] = useState(0);
  const [ocorrenciasPendentes, setOcorrenciasPendentes] = useState(0);
  const [anunciosPendentes, setAnunciosPendentes] = useState(0);
  const [totalMarketplace, setTotalMarketplace] = useState(0);
  const [proximasReservas, setProximasReservas] = useState<LinhaReserva[]>([]);

  useEffect(() => {
    getAnunciosEscola().then(anuncios => {
      setFigurinosDisponiveis(anuncios.filter(a => a.estado_anuncio?.nome === 'Disponível').length);
    });

    if (utilizadorAtual?.tipo === 'funcionario') {
      getReservas().then(reservas => {
        const ativas = reservas.filter(r => {
          const e = r.estado?.toUpperCase();
          return e === 'CONFIRMADA' || e === 'APROVADA' || e === 'EM CURSO';
        });
        setReservasAtivas(ativas.length);
      });
      getOcorrencias().then(ocs => {
        setOcorrenciasPendentes(ocs.filter(o => {
          const e = o.estado?.toLowerCase();
          return e === 'em análise' || e === 'pendente';
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
          return e === 'CONFIRMADA' || e === 'APROVADA' || e === 'EM CURSO';
        });
        setReservasAtivas(ativas.length);
        const proximas = reservas
          .filter(r => r.estado?.toUpperCase() === 'CONFIRMADA' || r.estado?.toUpperCase() === 'APROVADA')
          .flatMap(r => r.linhas)
          .slice(0, 3);
        setProximasReservas(proximas);
      });
      getMarketplace().then(anuncios => {
        setTotalMarketplace(anuncios.length);
      });
    }
  }, [utilizadorAtual?.tipo]);

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
      link: "/administracao",
    },
  ];

  const atividadeRecente = [
    {
      tipo: "Reserva",
      descricao: "Nova reserva criada - Vestido Vitoriano Azul",
      tempo: "Há 2 horas",
      icon: Calendar,
      cor: "text-blue-600",
    },
    {
      tipo: "Marketplace",
      descricao: "Novo anúncio submetido - Fato de Super-Herói",
      tempo: "Há 5 horas",
      icon: ShoppingBag,
      cor: "text-purple-600",
    },
    {
      tipo: "Devolução",
      descricao: "Figurino devolvido - Vestido Charleston Anos 20",
      tempo: "Ontem",
      icon: Shirt,
      cor: "text-green-600",
    },
    {
      tipo: "Ocorrência",
      descricao: "Nova ocorrência reportada",
      tempo: "Há 2 dias",
      icon: AlertCircle,
      cor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Secção de Boas-Vindas */}
      <div className="bg-gradient-to-r from-fig-purple via-fig-dark to-fig-magenta rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo{utilizadorAtual?.tipo === 'funcionario' && 'a'} ao FigHappens, {utilizadorAtual?.nome.split(' ')[0]}! 👋
        </h1>
        {utilizadorAtual?.tipo === 'aluno' && (
          <p className="text-fig-green-light text-lg">
            Explore o catálogo e faça as suas reservas de figurinos.
          </p>
        )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade Recente */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Atividade Recente</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {atividadeRecente.map((atividade, index) => {
              const Icon = atividade.icon;
              return (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                  <div className={`${atividade.cor} mt-1`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{atividade.tipo}</p>
                    <p className="text-sm text-gray-600 truncate">{atividade.descricao}</p>
                    <p className="text-xs text-gray-400 mt-1">{atividade.tempo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximas Reservas ou Alertas */}
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
                    to="/administracao"
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
