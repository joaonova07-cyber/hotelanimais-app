import { useState } from 'react'
import { Link } from 'react-router-dom'
import './FormularioReserva.css'

const API = 'http://localhost:3001/hotelanimais'
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

    try {
      setAVerificar(true)
      setMensagem('')
      setReservaCriada(null)

      // URLSearchParams cria a query string de forma segura.
      const parametros = new URLSearchParams({
        inicio: dataInicio,
        fim: dataFim,
        quantidade: String(Number(quantidade)),
      })

      const resposta = await fetch(
        `${API}/itens/${itemId}/disponibilidade?${parametros}`,
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados.erro || 'Não foi possível verificar a disponibilidade.',
        )
      }

      setDisponivel(dados.disponivel)
      setMensagem(
        dados.disponivel
          ? 'O espaço está disponível para estas datas.'
          : 'Este espaço não está disponível para estas datas.',
      )
    } catch (erro) {
      setDisponivel(false)
      setMensagem(erro.message)
    } finally {
      setAVerificar(false)
    }
  }

  async function criarReserva() {
    const novosErros = validarReserva()
    setErros(novosErros)

    if (Object.keys(novosErros).length > 0) {
      return
    }

    try {
      setAReservar(true)
      setMensagem('')

      // A API exige itemId e quantidade como valores numéricos.
      const resposta = await fetch(`${API}/reservas`, {
        method: 'POST',
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

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Não foi possível criar a reserva.')
      }

      setReservaCriada(dados)
      setDisponivel(true)
      localStorage.setItem(
        'hotelanimais-email',
        email.trim().toLowerCase(),
      )
    } catch (erro) {
      // Um erro 409 significa que já não existe disponibilidade.
      setDisponivel(false)
      setMensagem(erro.message)
    } finally {
      setAReservar(false)
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
            <p className="mensagem-erro">{erros.dataInicio}</p>
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
            <p className="mensagem-erro">{erros.dataFim}</p>
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
            <p className="mensagem-erro">{erros.quantidade}</p>
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
          {erros.nome && <p className="mensagem-erro">{erros.nome}</p>}
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
          {erros.email && <p className="mensagem-erro">{erros.email}</p>}
        </label>

        <button type="submit" disabled={aVerificar || aReservar}>
          {aVerificar ? 'A verificar...' : 'Verificar disponibilidade'}
        </button>
      </form>

      {mensagem && (
        <p
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
