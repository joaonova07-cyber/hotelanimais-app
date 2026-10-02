import { useEffect, useState } from "react";
import { listarEspacos } from "../services/api";
import CartaoEspaco from "../components/CartaoEspaco";
import FiltrosEspacos from "../components/FiltrosEspacos";

function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function valoresUnicos(espacos, campo) {
  return [...new Set(
    espacos
      .map((espaco) => espaco[campo])
      .filter((valor) => typeof valor === "string" && valor.trim())
  )].sort((a, b) => a.localeCompare(b, "pt"));
}

export default function ListaEspacos() {
  const [espacos, setEspacos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  const [pesquisa, setPesquisa] = useState("");
  const [animal, setAnimal] = useState("");
  const [porte, setPorte] = useState("");
  const [ordenacao, setOrdenacao] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        setErro("");
        setACarregar(true);

        const dados = await listarEspacos(controller.signal);

        if (!controller.signal.aborted) {
          setEspacos(dados);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErro(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setACarregar(false);
        }
      }
    }

    carregar();

    return () => controller.abort();
  }, []);

  function limparFiltros() {
    setPesquisa("");
    setAnimal("");
    setPorte("");
    setOrdenacao("");
  }

  const animais = valoresUnicos(espacos, "categoria");
  const portes = valoresUnicos(espacos, "porte");
  const termo = normalizar(pesquisa);

  const filtrados = espacos.filter((espaco) => {
    const texto = normalizar(
      `${espaco.nome ?? ""} ${espaco.descricao ?? ""} ${
        espaco.localizacao ?? ""
      }`
    );

    const correspondePesquisa = texto.includes(termo);
    const correspondeAnimal = !animal || espaco.categoria === animal;
    const correspondePorte = !porte || espaco.porte === porte;

    return correspondePesquisa && correspondeAnimal && correspondePorte;
  });

  const espacosVisiveis = [...filtrados];

  if (ordenacao === "preco-asc") {
    espacosVisiveis.sort((a, b) => a.precoNoite - b.precoNoite);
  } else if (ordenacao === "preco-desc") {
    espacosVisiveis.sort((a, b) => b.precoNoite - a.precoNoite);
  } else if (ordenacao === "avaliacao-desc") {
    espacosVisiveis.sort(
      (a, b) => (b.avaliacao ?? 0) - (a.avaliacao ?? 0)
    );
  }

  if (aCarregar) {
    return <p role="status">A carregar espaços...</p>;
  }

  if (erro) {
    return (
      <p className="mensagem-erro" role="alert">
        {erro} Confirma que a API está a funcionar.
      </p>
    );
  }

  return (
    <>
      <FiltrosEspacos
        pesquisa={pesquisa}
        setPesquisa={setPesquisa}
        animal={animal}
        setAnimal={setAnimal}
        porte={porte}
        setPorte={setPorte}
        ordenacao={ordenacao}
        setOrdenacao={setOrdenacao}
        animais={animais}
        portes={portes}
        limparFiltros={limparFiltros}
      />

      <p role="status">
        {espacosVisiveis.length} espaço(s) encontrado(s)
      </p>

      {espacosVisiveis.length === 0 ? (
        <p>Nenhum espaço corresponde aos critérios escolhidos.</p>
      ) : (
        <div className="lista-espacos">
          {espacosVisiveis.map((espaco) => (
            <CartaoEspaco key={espaco.id} espaco={espaco} />
          ))}
        </div>
      )}
    </>
  );
}