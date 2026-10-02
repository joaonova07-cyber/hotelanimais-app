import { Link, Route, Routes } from "react-router-dom";
import ListaEspacos from "./pages/ListaEspacos";
import PaginaEspaco from "./pages/PaginaEspaco";
import Favoritos from "./pages/Favoritos";
import Reservas from "./pages/Reservas";

export default function App() {
  return (
    <>
      <header className="cabecalho">
        <div className="contentor">
          <div className="topo">
            <div>
              <h1>Hotel para Animais</h1>
              <p>Encontra o espaço ideal para o teu cão ou gato.</p>
            </div>
            <nav aria-label="Navegação principal">
              <Link to="/">Espaços</Link>
              <Link to="/favoritos">♥ Favoritos</Link>
              <Link to="/reservas">As minhas reservas</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="contentor">
        <Routes>
          <Route path="/" element={<ListaEspacos />} />

          <Route path="/espacos/:id" element={<PaginaEspaco />} />

          <Route path="/favoritos" element={<Favoritos />} />

          <Route path="/reservas" element={<Reservas />} />

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
