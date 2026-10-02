import { Link, useParams } from "react-router-dom";

export default function DetalheEspaco() {
  const { id } = useParams();

  return (
    <section>
      <Link to="/">← Voltar aos espaços</Link>

      <h2>Detalhe do espaço {id}</h2>

      <p>A página de detalhe e o formulário de reserva serão integrados aqui.</p>
    </section>
  );
}