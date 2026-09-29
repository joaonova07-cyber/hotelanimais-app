import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FormularioReserva from '../componentes/FormularioReserva'

const API = 'http://localhost:3001/hotelanimais'

function PaginaEspaco() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [espaco, setEspaco] = useState(null)
  const [aCarregar, setACarregar] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarEspaco() {
      try {
        setACarregar(true)
        setErro(null)

        const resposta = await fetch(`${API}/itens/${id}`)

        if (!resposta.ok) {
          throw new Error('Espaço não encontrado.')
        }

        const dados = await resposta.json()
        setEspaco(dados)
      } catch {
        setErro('Não foi possível carregar este espaço.')
      } finally {
        setACarregar(false)
      }
    }

    carregarEspaco()
  }, [id])

  if (aCarregar) {
    return <p>A carregar espaço...</p>
  }

  if (erro) {
    return <p>{erro}</p>
  }

  if (!espaco) {
    return <p>Espaço não encontrado.</p>
  }

  return (
    <section className="pagina-espaco">
      <button type="button" onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      {espaco.imagem ? (
        <img src={espaco.imagem} alt={espaco.nome} />
      ) : (
        <p>Imagem ainda não disponível.</p>
      )}

      <h1>{espaco.nome}</h1>

      <p>
        {espaco.categoria} · Porte {espaco.porte} · {espaco.localizacao}
      </p>

      <p>{espaco.descricao}</p>

      <p>Preço por noite: {espaco.precoNoite} €</p>
      <p>Capacidade: {espaco.capacidade} animal(is)</p>
      <p>Avaliação: {espaco.avaliacao} / 5</p>
      <p>Passeios diários: {espaco.passeiosDiarios}</p>

      {/* O formulário recebe os limites e o preço do espaço já carregado. */}
    <FormularioReserva
    itemId={espaco.id}
    capacidade={espaco.capacidade}
    precoNoite={espaco.precoNoite}
    />
    </section>
  )
}

export default PaginaEspaco