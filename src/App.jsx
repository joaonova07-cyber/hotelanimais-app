import { Link, Route, Routes } from "react-router-dom";
import ListaEspacos from "./pages/ListaEspacos";
import DetalheEspaco from "./pages/DetalheEspaco";

export default function App() {
  return (
    <>
      <header className="cabecalho">
        <div className="contentor">
          <h1>Hotel para Animais</h1>
          <p>Encontra o espaço ideal para o teu cão ou gato.</p>
        </div>
      </header>

      <main className="contentor">
        <Routes>
          <Route path="/" element={<ListaEspacos />} />

          <Route path="/espacos/:id" element={<DetalheEspaco />} />

          <Route
            path="*"
            element={
              <section>
                <h2>Página não encontrada</h2>
                <Link to="/">Voltar aos espaços</Link>
              </section>
            }
          />
        </Routes>
      </main>

      <footer className="rodape">
        <p>Hotel para Animais — Projeto final React</p>
      </footer>
    </>
  );
}