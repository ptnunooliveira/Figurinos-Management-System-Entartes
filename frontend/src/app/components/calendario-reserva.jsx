import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { toast } from "sonner";
import { getDisponibilidadeAnuncio } from "../lib/services";
const formatarData = (data) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};
const inicioDoDia = (data) => {
  const novaData = new Date(data);
  novaData.setHours(0, 0, 0, 0);
  return novaData;
};
const adicionarMeses = (data, meses) => {
  const novaData = new Date(data);
  novaData.setMonth(novaData.getMonth() + meses);
  return novaData;
};
const fimDoMes = (data) => new Date(data.getFullYear(), data.getMonth() + 1, 0);
const cadaDiaNoIntervalo = (inicio, fim) => {
  const dias = [];
  for (let cursor = inicioDoDia(inicio); cursor <= fim; cursor.setDate(cursor.getDate() + 1)) {
    dias.push(new Date(cursor));
  }
  return dias;
};
function CalendarioReserva({
  idAnuncio,
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange
}) {
  const hoje = useMemo(() => inicioDoDia(/* @__PURE__ */ new Date()), []);
  const [mesAtual, setMesAtual] = useState(hoje);
  const [datasIndisponiveis, setDatasIndisponiveis] = useState([]);
  const [aCarregar, setACarregar] = useState(false);
  const inicioConsulta = useMemo(() => {
    const inicioMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    return inicioMes < hoje ? hoje : inicioMes;
  }, [hoje, mesAtual]);
  const fimConsulta = useMemo(() => fimDoMes(mesAtual), [mesAtual]);
  useEffect(() => {
    let cancelado = false;
    const carregar = async () => {
      if (!idAnuncio) {
        setDatasIndisponiveis([]);
        return;
      }
      setACarregar(true);
      const dados = await getDisponibilidadeAnuncio(
        idAnuncio,
        formatarData(inicioConsulta),
        formatarData(fimConsulta)
      );
      if (!cancelado) {
        setDatasIndisponiveis(dados?.datas_indisponiveis ?? []);
        setACarregar(false);
      }
    };
    void carregar();
    return () => {
      cancelado = true;
    };
  }, [fimConsulta, idAnuncio, inicioConsulta]);
  const indisponiveisSet = useMemo(() => new Set(datasIndisponiveis), [datasIndisponiveis]);
  const datasIndisponiveisDate = useMemo(
    () => datasIndisponiveis.map((data) => /* @__PURE__ */ new Date(`${data}T00:00:00`)),
    [datasIndisponiveis]
  );
  const intervaloTemIndisponivel = (inicio, fim) => cadaDiaNoIntervalo(inicio, fim).some((dia) => indisponiveisSet.has(formatarData(dia)));
  const rangeSelecionado = dataInicio ? {
    from: /* @__PURE__ */ new Date(`${dataInicio}T00:00:00`),
    to: dataFim ? /* @__PURE__ */ new Date(`${dataFim}T00:00:00`) : void 0
  } : void 0;
  const handleSelecionar = (range) => {
    if (!range?.from) {
      onDataInicioChange("");
      onDataFimChange("");
      return;
    }
    if (indisponiveisSet.has(formatarData(range.from))) {
      toast.error("Esta data n\xE3o est\xE1 dispon\xEDvel para reserva.");
      return;
    }
    if (range.to && intervaloTemIndisponivel(range.from, range.to)) {
      toast.error("O per\xEDodo selecionado inclui datas indispon\xEDveis.");
      onDataInicioChange(formatarData(range.from));
      onDataFimChange("");
      return;
    }
    onDataInicioChange(formatarData(range.from));
    onDataFimChange(range.to ? formatarData(range.to) : "");
  };
  return <div className="space-y-1.5">
      <DayPicker
    mode="range"
    selected={rangeSelecionado}
    onSelect={handleSelecionar}
    month={mesAtual}
    onMonthChange={setMesAtual}
    numberOfMonths={1}
    disabled={[{ before: hoje }, ...datasIndisponiveisDate]}
    modifiers={{
      disponivel: (date) => date >= hoje && !indisponiveisSet.has(formatarData(date)),
      indisponivel: datasIndisponiveisDate
    }}
    modifiersStyles={{
      disponivel: {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
        fontWeight: 600
      },
      indisponivel: {
        backgroundColor: "#f3f4f6",
        color: "#9ca3af",
        textDecoration: "line-through",
        cursor: "not-allowed"
      },
      disabled: {
        backgroundColor: "#f3f4f6",
        color: "#9ca3af",
        textDecoration: "line-through",
        cursor: "not-allowed"
      },
      selected: {
        backgroundColor: "var(--fig-purple)",
        color: "white",
        fontWeight: 700
      },
      range_start: {
        backgroundColor: "var(--fig-purple)",
        color: "white",
        fontWeight: 700
      },
      range_end: {
        backgroundColor: "var(--fig-purple)",
        color: "white",
        fontWeight: 700
      },
      range_middle: {
        backgroundColor: "rgba(124, 58, 237, 0.18)",
        color: "var(--fig-purple)",
        fontWeight: 700
      }
    }}
    styles={{
      months: { justifyContent: "center" },
      month: { width: "100%" },
      table: { width: "100%" },
      head_cell: { fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, padding: "0" },
      cell: { padding: "1px" },
      day: { width: "1.75rem", height: "1.75rem", borderRadius: "0.25rem", margin: "0 auto", fontSize: "0.75rem" },
      caption: { paddingBottom: "0.15rem", fontSize: "0.8rem" },
      nav_button: { width: "1.5rem", height: "1.5rem" }
    }}
    className="max-w-sm rounded-lg border border-gray-200 p-2"
  />
      <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-200" />
            Disponível
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-gray-200" />
            Indisponível
          </span>
        </div>
        <span className="italic truncate">
          {dataInicio ? dataFim ? `${(/* @__PURE__ */ new Date(`${dataInicio}T00:00:00`)).toLocaleDateString("pt-PT")} \u2192 ${(/* @__PURE__ */ new Date(`${dataFim}T00:00:00`)).toLocaleDateString("pt-PT")}` : `${(/* @__PURE__ */ new Date(`${dataInicio}T00:00:00`)).toLocaleDateString("pt-PT")} \u2014 escolha fim` : "Escolha o per\xEDodo"}
        </span>
        {aCarregar && <span className="text-gray-400 shrink-0">A verificar...</span>}
      </div>
    </div>;
}
export {
  CalendarioReserva
};
