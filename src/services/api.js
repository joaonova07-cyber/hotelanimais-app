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
