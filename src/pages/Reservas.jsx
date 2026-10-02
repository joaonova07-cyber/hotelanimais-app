import { useEffect, useRef, useState } from "react";
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
  const [emailGuardado, setEmailGuardado] = useState(
    () => localStorage.getItem("hotelanimais-email") ?? "",
  );
  const [emailIntroduzido, setEmailIntroduzido] = useState(emailGuardado);
  const [erroEmail, setErroEmail] = useState("");
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [idACancelar, setIdACancelar] = useState(null);
  const controllerCancelamentoRef = useRef(null);
  const montadoRef = useRef(true);

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

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
      controllerCancelamentoRef.current?.abort();
    };
  }, []);

  const minhasReservas = emailGuardado
    ? reservas.filter(
        (reserva) =>
          typeof reserva.email === "string" &&
          reserva.email.toLowerCase() === emailGuardado.toLowerCase(),
      )
    : [];

  function guardarEmail(evento) {
    evento.preventDefault();
    const emailNormalizado = emailIntroduzido.trim().toLowerCase();
    setErroEmail("");
    setErro("");
    setSucesso("");

    if (!/^\S+@\S+\.\S+$/.test(emailNormalizado)) {
      setErroEmail("Indica um email válido.");
      return;
    }

    localStorage.setItem("hotelanimais-email", emailNormalizado);
    setEmailGuardado(emailNormalizado);
    setEmailIntroduzido(emailNormalizado);
    setErroEmail("");
  }

  async function tratarCancelamento(reserva) {
    const confirmado = window.confirm(
      `Tens a certeza de que queres cancelar a reserva em ${reserva.itemNome}?`,
    );

    if (!confirmado) return;

    try {
      const controller = new AbortController();
      controllerCancelamentoRef.current = controller;
      setIdACancelar(reserva.id);
      setErro("");
      setSucesso("");
      await cancelarReserva(reserva.id, controller.signal);
      if (montadoRef.current) {
        setReservas((atuais) =>
          atuais.filter((reservaAtual) => reservaAtual.id !== reserva.id),
        );
        setSucesso("Reserva cancelada com sucesso.");
      }
    } catch (error) {
      if (montadoRef.current && error.name !== "AbortError") setErro(error.message);
    } finally {
      controllerCancelamentoRef.current = null;
      if (montadoRef.current) setIdACancelar(null);
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

      <form className="filtro-email-reservas" onSubmit={guardarEmail} noValidate>
        <label htmlFor="email-reservas">Email usado na reserva</label>
        <div>
          <input
            id="email-reservas"
            type="email"
            value={emailIntroduzido}
            onChange={(evento) => setEmailIntroduzido(evento.target.value)}
            aria-invalid={Boolean(erroEmail)}
            aria-describedby={erroEmail ? "erro-email-reservas" : undefined}
            placeholder="nome@exemplo.pt"
          />
          <button type="submit" disabled={idACancelar !== null}>
            {emailGuardado ? "Alterar email" : "Ver reservas"}
          </button>
        </div>
        {erroEmail && (
          <p id="erro-email-reservas" className="mensagem-erro" role="alert">
            {erroEmail}
          </p>
        )}
        {emailGuardado && (
          <p className="email-em-uso">A mostrar reservas de {emailGuardado}.</p>
        )}
      </form>

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

      {!emailGuardado ? (
        <div className="estado-vazio">
          <span aria-hidden="true">✉️</span>
          <h3>Indica o teu email</h3>
          <p>Usa o mesmo email com que fizeste a reserva.</p>
        </div>
      ) : minhasReservas.length === 0 && !erro ? (
        <div className="estado-vazio">
          <span aria-hidden="true">📅</span>
          <h3>Não existem reservas para este email</h3>
          <p>Confirma o email ou cria uma nova reserva.</p>
        </div>
      ) : (
        <div className="lista-reservas">
          {minhasReservas.map((reserva) => {
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
                  disabled={idACancelar !== null}
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
