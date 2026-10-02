import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../services/api'
import './FormularioReserva.css'

const hoje = new Date().toISOString().slice(0, 10)

function FormularioReserva({ itemId, capacidade, precoNoite }) {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [erros, setErros] = useState({})
  const [aVerificar, setAVerificar] = useState(false)
  const [aReservar, setAReservar] = useState(false)
  const [disponivel, setDisponivel] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [reservaCriada, setReservaCriada] = useState(null)
  const pedidosRef = useRef(new Set())
  const montadoRef = useRef(true)

  useEffect(() => {
    montadoRef.current = true
    const pedidos = pedidosRef.current
    return () => {
      montadoRef.current = false
      pedidos.forEach((controller) => controller.abort())
    }
  }, [])

  async function lerResposta(resposta, mensagemPadrao) {
    let dados
    try {
      dados = await resposta.json()
    } catch {
      throw new Error(`${mensagemPadrao} A API devolveu uma resposta inválida.`)
    }
    if (!resposta.ok) throw new Error(dados?.erro || mensagemPadrao)
    return dados
  }

  function invalidarDisponibilidade() {
    setDisponivel(null)
    setMensagem('')
    setReservaCriada(null)
  }

  function alterarDataInicio(valor) {
    setDataInicio(valor)
    invalidarDisponibilidade()
  }

  function alterarDataFim(valor) {
    setDataFim(valor)
    invalidarDisponibilidade()
  }

  function alterarQuantidade(valor) {
    setQuantidade(valor)
    invalidarDisponibilidade()
  }

  function validarReserva() {
    const novosErros = {}
    const quantidadeNumerica = Number(quantidade)

    if (!dataInicio) {
      novosErros.dataInicio = 'Indica a data de entrada.'
    } else if (dataInicio < hoje) {
      novosErros.dataInicio = 'A data de entrada não pode ser anterior a hoje.'
    }

    if (!dataFim) {
      novosErros.dataFim = 'Indica a data de saída.'
    } else if (dataInicio && dataFim <= dataInicio) {
      novosErros.dataFim =
        'A data de saída tem de ser posterior à data de entrada.'
    }

    if (
      !Number.isInteger(quantidadeNumerica) ||
      quantidadeNumerica < 1 ||
      quantidadeNumerica > capacidade
    ) {
      novosErros.quantidade =
        `Indica entre 1 e ${capacidade} animal(is).`
    }

    if (nome.trim().length < 2) {
      novosErros.nome = 'Indica um nome válido.'
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      novosErros.email = 'Indica um email válido.'
    }

    return novosErros
  }

  async function verificarDisponibilidade(evento) {
    evento.preventDefault()

    const novosErros = validarReserva()
    setErros(novosErros)

    if (Object.keys(novosErros).length > 0) {
      return
    }

    const controller = new AbortController()
    try {
      pedidosRef.current.add(controller)
      setAVerificar(true)
      setMensagem('')
      setReservaCriada(null)

      // URLSearchParams cria a query string de forma segura.
      const parametros = new URLSearchParams({
        inicio: dataInicio,
        fim: dataFim,
        quantidade: String(Number(quantidade)),
      })

      const resposta = await fetch(`${API_URL}/itens/${itemId}/disponibilidade?${parametros}`, { signal: controller.signal })
      const dados = await lerResposta(resposta, 'Não foi possível verificar a disponibilidade.')

      if (montadoRef.current) {
        setDisponivel(dados.disponivel)
        setMensagem(
          dados.disponivel
            ? 'O espaço está disponível para estas datas.'
            : 'Este espaço não está disponível para estas datas.',
        )
      }
    } catch (erro) {
      if (montadoRef.current && erro.name !== 'AbortError') {
        setDisponivel(false)
        setMensagem(erro instanceof TypeError ? 'Não foi possível contactar a API.' : erro.message)
      }
    } finally {
      pedidosRef.current.delete(controller)
      if (montadoRef.current) setAVerificar(false)
    }
  }

  async function criarReserva() {
    const novosErros = validarReserva()
    setErros(novosErros)

    if (Object.keys(novosErros).length > 0) {
      return
    }

    const controller = new AbortController()
    try {
      pedidosRef.current.add(controller)
      setAReservar(true)
      setMensagem('')
      setReservaCriada(null)

      // A API exige itemId e quantidade como valores numéricos.
      const resposta = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: Number(itemId),
          dataInicio,
          dataFim,
          quantidade: Number(quantidade),
          nome: nome.trim(),
          email: email.trim(),
        }),
      })

      const dados = await lerResposta(resposta, 'Não foi possível criar a reserva.')

      if (montadoRef.current) {
        setReservaCriada(dados)
        setDisponivel(true)
        localStorage.setItem(
          'hotelanimais-email',
          email.trim().toLowerCase(),
        )
      }
    } catch (erro) {
      // Um erro 409 significa que já não existe disponibilidade.
      if (montadoRef.current && erro.name !== 'AbortError') {
        setDisponivel(false)
        setMensagem(erro instanceof TypeError ? 'Não foi possível contactar a API.' : erro.message)
      }
    } finally {
      pedidosRef.current.delete(controller)
      if (montadoRef.current) setAReservar(false)
    }
  }

  return (
    <section className="formulario-reserva">
      <h2>Reservar este espaço</h2>

      <p>Preço por noite: {precoNoite} €</p>
      <p>Capacidade máxima: {capacidade} animal(is)</p>

      <form noValidate onSubmit={verificarDisponibilidade}>
        <label>
          Data de entrada
          <input
            type="date"
            min={hoje}
            value={dataInicio}
            onChange={(evento) => alterarDataInicio(evento.target.value)}
            className={erros.dataInicio ? 'campo-erro' : ''}
            aria-invalid={Boolean(erros.dataInicio)}
          />
          {erros.dataInicio && (
            <p className="mensagem-erro" role="alert">{erros.dataInicio}</p>
          )}
        </label>

        <label>
          Data de saída
          <input
            type="date"
            min={dataInicio || hoje}
            value={dataFim}
            onChange={(evento) => alterarDataFim(evento.target.value)}
            className={erros.dataFim ? 'campo-erro' : ''}
            aria-invalid={Boolean(erros.dataFim)}
          />
          {erros.dataFim && (
            <p className="mensagem-erro" role="alert">{erros.dataFim}</p>
          )}
        </label>

        <label>
          Número de animais
          <input
            type="number"
            min="1"
            max={capacidade}
            step="1"
            value={quantidade}
            onChange={(evento) => alterarQuantidade(evento.target.value)}
            className={erros.quantidade ? 'campo-erro' : ''}
            aria-invalid={Boolean(erros.quantidade)}
          />
          {erros.quantidade && (
            <p className="mensagem-erro" role="alert">{erros.quantidade}</p>
          )}
        </label>

        <label>
          Nome
          <input
            type="text"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            className={erros.nome ? 'campo-erro' : ''}
            aria-invalid={Boolean(erros.nome)}
          />
          {erros.nome && <p className="mensagem-erro" role="alert">{erros.nome}</p>}
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            className={erros.email ? 'campo-erro' : ''}
            aria-invalid={Boolean(erros.email)}
          />
          {erros.email && <p className="mensagem-erro" role="alert">{erros.email}</p>}
        </label>

        <button type="submit" disabled={aVerificar || aReservar}>
          {aVerificar ? 'A verificar disponibilidade...' : 'Verificar disponibilidade'}
        </button>
      </form>

      {mensagem && (
        <p
          role={disponivel ? 'status' : 'alert'}
          className={
            disponivel ? 'mensagem-disponivel' : 'mensagem-indisponivel'
          }
        >
          {mensagem}
        </p>
      )}

      {disponivel && !reservaCriada && (
        <button type="button" onClick={criarReserva} disabled={aReservar}>
          {aReservar ? 'A criar reserva...' : 'Confirmar reserva'}
        </button>
      )}

      {aReservar && <p role="status">A criar reserva...</p>}

      {reservaCriada && (
        <section className="reserva-confirmada">
          <h3>Reserva criada com sucesso</h3>

          <p>Total: {Number(reservaCriada.total).toFixed(2)} €</p>
          <Link className="ligacao-reservas" to="/reservas">
            Ver as minhas reservas
          </Link>
        </section>
      )}
    </section>
  )
}

export default FormularioReserva
