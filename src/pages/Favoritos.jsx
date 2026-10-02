import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CartaoEspaco from "../components/CartaoEspaco";
import { listarEspacos } from "../services/api";
import { getFavoriteIds } from "../utils/favorites";

export default function Favoritos() {
  const [espacos, setEspacos] = useState([]);
  const [favoritos, setFavoritos] = useState(() => getFavoriteIds());
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        setErro("");
        setACarregar(true);
        const dados = await listarEspacos(controller.signal);

        if (!controller.signal.aborted) setEspacos(dados);
      } catch (error) {
        if (!controller.signal.aborted) setErro(error.message);
      } finally {
        if (!controller.signal.aborted) setACarregar(false);
      }
    }

    carregar();
    return () => controller.abort();
  }, []);

  function atualizarFavoritos(itemId, favorite) {
    if (!favorite) {
      setFavoritos((atuais) => atuais.filter((id) => id !== Number(itemId)));
    }
  }

  const espacosFavoritos = espacos.filter((espaco) =>
    favoritos.includes(Number(espaco.id))
  );

  if (aCarregar) return <p role="status">A carregar espaços...</p>;

  if (erro) {
    return (
      <p className="mensagem-erro" role="alert">
        {erro}
      </p>
    );
  }

  return (
    <section aria-labelledby="titulo-favoritos">
      <div className="cabecalho-pagina">
        <div>
          <h2 id="titulo-favoritos">Os meus favoritos</h2>
          <p>Consulta os espaços que guardaste para mais tarde.</p>
        </div>
        <Link className="ligacao-secundaria" to="/">
          Ver todos os espaços
        </Link>
      </div>

      {espacosFavoritos.length === 0 ? (
        <div className="estado-vazio">
          <span aria-hidden="true">♡</span>
          <h3>Ainda não tens favoritos</h3>
          <p>Adiciona espaços através do botão de coração.</p>
          <Link className="botao-detalhe" to="/">
            Explorar espaços
          </Link>
        </div>
      ) : (
        <>
          <p role="status">{espacosFavoritos.length} espaço(s) favorito(s)</p>
          <div className="lista-espacos">
            {espacosFavoritos.map((espaco) => (
              <CartaoEspaco
                key={espaco.id}
                espaco={espaco}
                onFavoriteChange={atualizarFavoritos}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
