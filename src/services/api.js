export const API_URL = "http://localhost:3001/hotelanimais";

export async function listarEspacos(signal) {
  const resposta = await fetch(`${API_URL}/itens`, { signal });

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar os espaços.");
  }

  const dados = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error("A API não devolveu uma lista de espaços.");
  }

  return dados;
}

export async function listarReservas(signal) {
  const resposta = await fetch(`${API_URL}/reservas`, { signal });

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar as reservas.");
  }

  const dados = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error("A API não devolveu uma lista de reservas.");
  }

  return dados;
}

export async function cancelarReserva(id) {
  const resposta = await fetch(`${API_URL}/reservas/${id}`, {
    method: "DELETE",
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
