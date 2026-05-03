import { useEffect, useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { toast } from "sonner";
import { getDisponibilidadeAnuncio } from "../lib/services";

interface CalendarioReservaProps {
  idAnuncio: number | null;
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (data: string) => void;
  onDataFimChange: (data: string) => void;
}

const formatarData = (data: Date) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const inicioDoDia = (data: Date) => {
  const novaData = new Date(data);
  novaData.setHours(0, 0, 0, 0);
  return novaData;
};

const adicionarMeses = (data: Date, meses: number) => {
  const novaData = new Date(data);
  novaData.setMonth(novaData.getMonth() + meses);
  return novaData;
};

const fimDoMes = (data: Date) => new Date(data.getFullYear(), data.getMonth() + 1, 0);

const cadaDiaNoIntervalo = (inicio: Date, fim: Date) => {
  const dias: Date[] = [];
  for (let cursor = inicioDoDia(inicio); cursor <= fim; cursor.setDate(cursor.getDate() + 1)) {
    dias.push(new Date(cursor));
  }
  return dias;
};

export function CalendarioReserva({
  idAnuncio,
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
}: CalendarioReservaProps) {
  const hoje = useMemo(() => inicioDoDia(new Date()), []);
  const [mesAtual, setMesAtual] = useState(hoje);
  const [datasIndisponiveis, setDatasIndisponiveis] = useState<string[]>([]);
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
        formatarData(fimConsulta),
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
    () => datasIndisponiveis.map((data) => new Date(`${data}T00:00:00`)),
    [datasIndisponiveis],
  );

  const intervaloTemIndisponivel = (inicio: Date, fim: Date) =>
    cadaDiaNoIntervalo(inicio, fim).some((dia) => indisponiveisSet.has(formatarData(dia)));

  const rangeSelecionado: DateRange | undefined = dataInicio
    ? {
        from: new Date(`${dataInicio}T00:00:00`),
        to: dataFim ? new Date(`${dataFim}T00:00:00`) : undefined,
      }
    : undefined;

  const handleSelecionar = (range?: DateRange) => {
    if (!range?.from) {
      onDataInicioChange("");
      onDataFimChange("");
      return;
    }

    if (indisponiveisSet.has(formatarData(range.from))) {
      toast.error("Esta data não está disponível para reserva.");
      return;
    }

    if (range.to && intervaloTemIndisponivel(range.from, range.to)) {
      toast.error("O período selecionado inclui datas indisponíveis.");
      onDataInicioChange(formatarData(range.from));
      onDataFimChange("");
      return;
    }

    onDataInicioChange(formatarData(range.from));
    onDataFimChange(range.to ? formatarData(range.to) : "");
  };

  return (
    <div className="space-y-3">
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
          indisponivel: datasIndisponiveisDate,
        }}
        modifiersStyles={{
          disponivel: {
            backgroundColor: "#dbeafe",
            color: "#1d4ed8",
            fontWeight: 600,
          },
          indisponivel: {
            backgroundColor: "#f3f4f6",
            color: "#9ca3af",
            textDecoration: "line-through",
            cursor: "not-allowed",
          },
          disabled: {
            backgroundColor: "#f3f4f6",
            color: "#9ca3af",
            textDecoration: "line-through",
            cursor: "not-allowed",
          },
          selected: {
            backgroundColor: "var(--fig-purple)",
            color: "white",
            fontWeight: 700,
          },
          range_start: {
            backgroundColor: "var(--fig-purple)",
            color: "white",
            fontWeight: 700,
          },
          range_end: {
            backgroundColor: "var(--fig-purple)",
            color: "white",
            fontWeight: 700,
          },
          range_middle: {
            backgroundColor: "rgba(124, 58, 237, 0.18)",
            color: "var(--fig-purple)",
            fontWeight: 700,
          },
        }}
        styles={{
          months: { justifyContent: "center" },
          month: { width: "100%" },
          table: { width: "100%" },
          head_cell: { fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 },
          cell: { padding: "2px" },
          day: { width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", margin: "0 auto" },
          caption: { paddingBottom: "0.5rem" },
        }}
        className="max-w-sm rounded-lg border border-gray-200 p-3"
      />
      <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
        {dataInicio ? (
          <span>
            Selecionado: {new Date(`${dataInicio}T00:00:00`).toLocaleDateString("pt-PT")}
            {dataFim ? ` até ${new Date(`${dataFim}T00:00:00`).toLocaleDateString("pt-PT")}` : " - escolha a data de fim"}
          </span>
        ) : (
          <span>Escolha a data de início e depois a data de fim.</span>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200" />
          Disponível
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
          Indisponível
        </span>
        {aCarregar && <span>A verificar disponibilidade...</span>}
      </div>
    </div>
  );
}
