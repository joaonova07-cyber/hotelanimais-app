export default function FiltrosEspacos({
  pesquisa,
  setPesquisa,
  animal,
  setAnimal,
  porte,
  setPorte,
  ordenacao,
  setOrdenacao,
  animais,
  portes,
  limparFiltros,
}) {
  return (
    <section className="filtros" aria-label="Pesquisar e filtrar espaços">
      <div className="campo">
        <label htmlFor="pesquisa">Pesquisar</label>
        <input
          id="pesquisa"
          type="search"
          placeholder="Nome, descrição ou localização..."
          value={pesquisa}
          onChange={(event) => setPesquisa(event.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="animal">Tipo de animal</label>
        <select
          id="animal"
          value={animal}
          onChange={(event) => setAnimal(event.target.value)}
        >
          <option value="">Todos</option>
          {animais.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="porte">Porte</label>
        <select
          id="porte"
          value={porte}
          onChange={(event) => setPorte(event.target.value)}
        >
          <option value="">Todos</option>
          {portes.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="ordenacao">Ordenar por</label>
        <select
          id="ordenacao"
          value={ordenacao}
          onChange={(event) => setOrdenacao(event.target.value)}
        >
          <option value="">Ordem original</option>
          <option value="preco-asc">Preço: menor para maior</option>
          <option value="preco-desc">Preço: maior para menor</option>
          <option value="avaliacao-desc">Melhor avaliação</option>
        </select>
      </div>

      <button type="button" onClick={limparFiltros}>
        Limpar filtros
      </button>
    </section>
  );
}