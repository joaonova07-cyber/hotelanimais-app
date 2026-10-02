import { useState } from "react";
import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
const formatoEuro = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

export default function CartaoEspaco({ espaco, onFavoriteChange }) {
  const [imagemFalhada, setImagemFalhada] = useState(null);

  const temImagem =
    espaco.imagem && imagemFalhada !== espaco.imagem;

  return (
    <article className="cartao">
      <div className="imagem-cartao">
        {temImagem ? (
          <img
            className="imagem-espaco"
            src={espaco.imagem}
            alt={espaco.nome}
            loading="lazy"
            onError={() => setImagemFalhada(espaco.imagem)}
          />
        ) : (
          <div
            className="imagem-substituta"
            role="img"
            aria-label="Espaço sem fotografia disponível"
          >
            🐾
          </div>
        )}
        <FavoriteButton
          itemId={espaco.id}
          onChange={(favorite) => onFavoriteChange?.(espaco.id, favorite)}
        />
      </div>

      <div className="conteudo-cartao">
        <h2>{espaco.nome}</h2>

        <p className="localizacao">{espaco.localizacao}</p>

        <p>{espaco.descricao}</p>

        <dl className="caracteristicas">
          <div>
            <dt>Animal</dt>
            <dd>{espaco.categoria}</dd>
          </div>

          <div>
            <dt>Porte</dt>
            <dd>{espaco.porte}</dd>
          </div>

          <div>
            <dt>Capacidade</dt>
            <dd>{espaco.capacidade} animais</dd>
          </div>

          <div>
            <dt>Avaliação</dt>
            <dd>{espaco.avaliacao ?? "Sem avaliação"}</dd>
          </div>
        </dl>

        <p className="preco">
          {formatoEuro.format(espaco.precoNoite)}
          <span> / noite</span>
        </p>
        <Link className="botao-detalhe" to={`/espacos/${espaco.id}`}>
            Ver detalhes
        </Link>
      </div>
    </article>
  );
}
