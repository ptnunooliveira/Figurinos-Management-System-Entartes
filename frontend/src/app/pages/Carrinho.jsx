import { useState } from "react";
import { useCart } from "./CartContext";
import { Trash2, ShoppingCart, Calendar } from "lucide-react";
import { criarReserva, getUtilizadores } from "../lib/services";
import { getUtilizadorAtual } from "../lib/auth";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
function Carrinho() {
  const utilizadorAtual = getUtilizadorAtual();
  const { items, removerDoCarrinho, limparCarrinho } = useCart();
  const [submetendo, setSubmetendo] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const isFuncionario = utilizadorAtual?.tipo === "funcionario" || utilizadorAtual?.tipo === "admin";
  const { data: utilizadores = [] } = useQuery({
    queryKey: ["utilizadores"],
    queryFn: getUtilizadores,
    enabled: isFuncionario
  });
  const formatarErroReserva = (mensagem) => {
    const match = mensagem.match(/O an[uú]ncio com o ID (\d+) j[aá] se encontra reservado para as datas selecionadas/i);
    if (!match) return mensagem;
    const idAnuncio = Number(match[1]);
    const item = items.find((i) => i.id_anuncio === idAnuncio);
    if (!item) return mensagem;
    return `O figurino "${item.figurino_nome}" j\xE1 se encontra reservado para as datas selecionadas.`;
  };
  const handleFinalizarReserva = async () => {
    if (items.length === 0) {
      toast.error("O carrinho est\xE1 vazio.");
      return;
    }
    if (isFuncionario && !alunoSelecionado) {
      toast.error("Por favor, selecione um aluno para a reserva.");
      return;
    }
    setSubmetendo(true);
    try {
      const linhasParaReserva = items.map((item) => ({
        id_anuncio: item.id_anuncio,
        datainicio: item.datainicio,
        datafim: item.datafim
      }));
      await criarReserva(
        linhasParaReserva,
        isFuncionario ? parseInt(alunoSelecionado) : void 0
      );
      toast.success("Reserva criada com sucesso!");
      limparCarrinho();
    } catch (error) {
      toast.error(formatarErroReserva(error.message || "Erro ao criar a reserva."));
    } finally {
      setSubmetendo(false);
    }
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-fig-purple" />
          Carrinho de Reservas
        </h1>
        <p className="text-gray-600">Reveja os figurinos que pretende reservar.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {items.length === 0 ? <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">O seu carrinho está vazio.</p>
          </div> : <div className="space-y-4">
            {items.map((item) => <div key={item.cartItemId} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-start gap-4">
                  {item.imagem_url ? <img src={item.imagem_url} alt={item.figurino_nome} className="w-16 h-16 object-cover rounded-lg border" /> : <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                      <ShoppingCart className="w-6 h-6 text-gray-400" />
                    </div>}
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.figurino_nome}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(item.datainicio).toLocaleDateString("pt-PT")} até {new Date(item.datafim).toLocaleDateString("pt-PT")}
                      </span>
                    </div>
                  </div>
                </div>
                <button
    onClick={() => removerDoCarrinho(item.cartItemId)}
    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
    title="Remover figurino"
  >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>)}

          {isFuncionario && <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">ID do aluno *</label>
              <select
    value={alunoSelecionado}
    onChange={(e) => setAlunoSelecionado(e.target.value)}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    required
  >
                <option value="">Selecione o ID do aluno</option>
                {utilizadores.map((u) => <option key={u.id} value={u.id}>#{u.id} - {u.nome}</option>)}
              </select>
            </div>}

            <div className="pt-6 border-t flex justify-end gap-4">
              <button
    onClick={handleFinalizarReserva}
    disabled={submetendo}
    className="px-6 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
                {submetendo ? "A processar..." : "Finalizar Reserva"}
              </button>
            </div>
          </div>}
      </div>
    </div>;
}
export {
  Carrinho
};
