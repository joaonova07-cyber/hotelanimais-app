export const API_URL = "http://localhost:3001/hotelanimais";

async function pedir(url, opcoes) {
  try {
    return await fetch(url, opcoes);
  } catch (erro) {
    if (erro.name === "AbortError") throw erro;
    throw new Error("Não foi possível contactar a API. Confirma que está a funcionar.");
  }
}

async function lerJson(resposta, mensagemRespostaInvalida) {
  try {
    return await resposta.json();
  } catch {
    throw new Error(mensagemRespostaInvalida);
  }
}

async function criarErroResposta(resposta, mensagemPadrao) {
  let mensagem = mensagemPadrao;
  try {
    const dados = await resposta.json();
    if (dados?.erro) mensagem = dados.erro;
  } catch {
    mensagem = `${mensagemPadrao} A API devolveu uma resposta inválida.`;
  }
  return new Error(mensagem);
}

export async function listarEspacos(signal) {
  const resposta = await pedir(`${API_URL}/itens`, { signal });

  if (!resposta.ok) {
    throw await criarErroResposta(resposta, resposta.status === 404 ? "Espaços não encontrados." : "Não foi possível carregar os espaços.");
  }

  const dados = await lerJson(resposta, "A API devolveu uma resposta inválida ao carregar os espaços.");

  if (!Array.isArray(dados)) {
    throw new Error("A API não devolveu uma lista de espaços.");
  }

  return dados;
}

export async function listarReservas(signal) {
  const resposta = await pedir(`${API_URL}/reservas`, { signal });

  if (!resposta.ok) {
    throw await criarErroResposta(resposta, "Não foi possível carregar as reservas.");
  }

  const dados = await lerJson(resposta, "A API devolveu uma resposta inválida ao carregar as reservas.");

  if (!Array.isArray(dados)) {
    throw new Error("A API não devolveu uma lista de reservas.");
  }

  return dados;
}

export async function cancelarReserva(id, signal) {
  const resposta = await pedir(`${API_URL}/reservas/${id}`, {
    method: "DELETE",
    signal,
  });

  if (!resposta.ok) {
    let mensagem = "Não foi possível cancelar a reserva.";

    try {
      const dados = await resposta.json();
      if (dados?.erro) mensagem = dados.erro;
    } catch {
      // Mantém a mensagem genérica se a resposta de erro não tiver JSON.
    }

    throw new Error(mensagem);
  }
}

export async function obterEspaco(id, signal) {
  const resposta = await pedir(`${API_URL}/itens/${id}`, { signal });
  if (!resposta.ok) {
    throw await criarErroResposta(resposta, resposta.status === 404 ? "Espaço não encontrado." : "Não foi possível carregar este espaço.");
  }
  return lerJson(resposta, "A API devolveu uma resposta inválida ao carregar o espaço.");
}
