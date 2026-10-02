import { useEffect, useState } from "react";
import { cancelarReserva, listarReservas } from "../services/api";

const formatoEuro = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

const formatoData = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

function formatarData(data) {
  const valor = new Date(`${data}T00:00:00Z`);
  return Number.isNaN(valor.getTime()) ? data : formatoData.format(valor);
}

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [idACancelar, setIdACancelar] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        setErro("");
        const dados = await listarReservas(controller.signal);
        if (!controller.signal.aborted) setReservas(dados);
      } catch (error) {
        if (!controller.signal.aborted) setErro(error.message);
      } finally {
        if (!controller.signal.aborted) setACarregar(false);
      }
    }

    carregar();
    return () => controller.abort();
  }, []);

  async function tratarCancelamento(reserva) {
    const confirmado = window.confirm(
      `Tens a certeza de que queres cancelar a reserva em ${reserva.itemNome}?`,
    );

    if (!confirmado) return;

    try {
      setIdACancelar(reserva.id);
      setErro("");
      setSucesso("");
      await cancelarReserva(reserva.id);
      setReservas((atuais) =>
        atuais.filter((reservaAtual) => reservaAtual.id !== reserva.id),
      );
      setSucesso("Reserva cancelada com sucesso.");
    } catch (error) {
      setErro(error.message);
    } finally {
      setIdACancelar(null);
    }
  }

  if (aCarregar) return <p role="status">A carregar reservas...</p>;

  return (
    <section aria-labelledby="titulo-reservas">
      <div className="cabecalho-pagina">
        <div>
          <h2 id="titulo-reservas">As minhas reservas</h2>
          <p>Consulta e gere as reservas registadas.</p>
        </div>
      </div>

      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}

      {sucesso && (
        <p className="mensagem-sucesso" role="status">
          {sucesso}
        </p>
      )}

      {reservas.length === 0 && !erro ? (
        <div className="estado-vazio">
          <span aria-hidden="true">📅</span>
          <h3>Ainda não existem reservas</h3>
          <p>As reservas criadas irão aparecer nesta página.</p>
        </div>
      ) : (
        <div className="lista-reservas">
          {reservas.map((reserva) => {
            const aCancelar = idACancelar === reserva.id;

            return (
              <article className="cartao-reserva" key={reserva.id}>
                <div className="cabecalho-reserva">
                  <div>
                    <p className="etiqueta-reserva">Reserva #{reserva.id}</p>
                    <h3>{reserva.itemNome}</h3>
                  </div>
                  <p className="total-reserva">
                    {formatoEuro.format(reserva.total)}
                  </p>
                </div>

                <dl className="detalhes-reserva">
                  <div><dt>Entrada</dt><dd>{formatarData(reserva.dataInicio)}</dd></div>
                  <div><dt>Saída</dt><dd>{formatarData(reserva.dataFim)}</dd></div>
                  <div><dt>Animais</dt><dd>{reserva.quantidade}</dd></div>
                  <div><dt>Responsável</dt><dd>{reserva.nome}</dd></div>
                  <div className="email-reserva"><dt>Email</dt><dd>{reserva.email}</dd></div>
                </dl>

                <button
                  className="botao-cancelar"
                  type="button"
                  disabled={aCancelar}
                  onClick={() => tratarCancelamento(reserva)}
                >
                  {aCancelar ? "A cancelar..." : "Cancelar reserva"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
