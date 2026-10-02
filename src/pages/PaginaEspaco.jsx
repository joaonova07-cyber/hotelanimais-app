import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FavoriteButton from '../components/FavoriteButton'
import FormularioReserva from '../components/FormularioReserva'
import { obterEspaco } from '../services/api'
import './PaginaEspaco.css'

function PaginaEspaco() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [espaco, setEspaco] = useState(null)
  const [aCarregar, setACarregar] = useState(true)
  const [erro, setErro] = useState(null)
  const [imagemFalhada, setImagemFalhada] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function carregarEspaco() {
      try {
        setACarregar(true)
        setErro(null)

        const dados = await obterEspaco(id, controller.signal)
        if (!controller.signal.aborted) setEspaco(dados)
      } catch (error) {
        if (!controller.signal.aborted) setErro(error.message)
      } finally {
        if (!controller.signal.aborted) setACarregar(false)
      }
    }

    carregarEspaco()
    return () => controller.abort()
  }, [id])

  if (aCarregar) {
    return <p role="status">A carregar detalhes...</p>
  }

  if (erro) {
    return <p className="mensagem-erro" role="alert">{erro}</p>
  }

  if (!espaco) {
    return <p className="mensagem-erro" role="alert">Espaço não encontrado.</p>
  }

  return (
    <section className="pagina-espaco">
      <button
        className="botao-voltar"
        type="button"
        onClick={() => navigate(-1)}
      >
        ← Voltar
      </button>

      {espaco.imagem && !imagemFalhada ? (
      <img
        className="imagem-espaco"
        src={espaco.imagem}
        alt={espaco.nome}
        onError={() => setImagemFalhada(true)}
      />
      ) : (
        <div className="imagem-substituta" role="img" aria-label="Espaço sem fotografia disponível">🐾</div>
      )}

      <div className="cabecalho-espaco">
        <h1>{espaco.nome}</h1>
        <FavoriteButton itemId={espaco.id} />
      </div>

      <p>
        {espaco.categoria} · Porte {espaco.porte} · {espaco.localizacao}
      </p>

      <p>{espaco.descricao}</p>

      <p>Preço por noite: {espaco.precoNoite} €</p>
      <p>Capacidade: {espaco.capacidade} animal(is)</p>
      <p>Avaliação: {espaco.avaliacao} / 5</p>
      <p>Passeios diários: {espaco.passeiosDiarios}</p>

      <p>
        Espaço exterior: {espaco.espacoExterior ? 'Disponível' : 'Não disponível'}
      </p>

      <p>
        Vigilância veterinária:{' '}
        {espaco.vigilanciaVeterinaria ? 'Disponível' : 'Não disponível'}
      </p>

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
