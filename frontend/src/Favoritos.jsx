// Tela de favoritos. Recebe a lista pronta do App.
export default function Favoritos({ favoritos, remover, irMapa }) {
  return (
    <section className="favoritos-page">
      <h1>Meus favoritos</h1>

      {favoritos.length === 0 ? (
        <div className="card">
          <p>Você ainda não favoritou nenhum local.</p>
          <button className="btn" onClick={irMapa}>Ir para o Mapa Calmo</button>
        </div>
      ) : (
        <div className="lista-favoritos">
          {favoritos.map((l) => (
            <article className="lugar-card" key={l.id}>
              <div className="lugar-topo">
                <h2>{l.nome}</h2>
              </div>
              <p>{l.endereco || l.descricao}</p>
              <div className="lugar-tags">
                {(l.tags || []).map((t) => <span key={t}>{t}</span>)}
              </div>
              <button className="btn ghost" onClick={() => remover(l)}>
                Remover dos favoritos
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}