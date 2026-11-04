import { useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Dados de exemplo (fixos). Troque depois por dados reais.
const LOCAIS = [
  { id: 1, nome: 'Café Romã', endereco: 'Rua das Flores, 42', pos: [-8.0632, -34.8712], tags: ['Baixo ruído', 'Luz suave'] },
  { id: 2, nome: 'Biblioteca Parque', endereco: 'Alameda Verde, 120', pos: [-8.0556, -34.8815], tags: ['Baixo ruído', 'Sem multidão'] },
  { id: 3, nome: 'Parque da Jaqueira', endereco: 'Rua Madre de Deus, s/n', pos: [-8.0366, -34.9027], tags: ['Sem multidão', 'Espaço aberto'] },
  { id: 4, nome: 'Jardim da Praça', endereco: 'Av. Conde da Boa Vista, 500', pos: [-8.0585, -34.8890], tags: ['Luz suave', 'Espaço aberto'] },
]

const FILTROS = ['Baixo ruído', 'Luz suave', 'Sem multidão', 'Espaço aberto']
const CENTRO_RECIFE = [-8.0476, -34.877]

const icone = (nome) =>
  L.divIcon({
    className: 'pin',
    html: `<span class="pin-label">${nome}</span><span class="pin-dot"></span>`,
    iconSize: [0, 0],
  })

export default function MapaCalmo() {
  const [busca, setBusca] = useState('')
  const [ativos, setAtivos] = useState([])

  const alternar = (f) =>
    setAtivos((a) => (a.includes(f) ? a.filter((x) => x !== f) : [...a, f]))

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return LOCAIS.filter(
      (l) =>
        (!termo || l.nome.toLowerCase().includes(termo) || l.endereco.toLowerCase().includes(termo)) &&
        ativos.every((f) => l.tags.includes(f))
    )
  }, [busca, ativos])

  return (
    <section className="mapa-page">
      <h1>Mapa Calmo</h1>

      <div className="busca-wrap">
        <svg className="busca-icone" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          className="busca"
          type="search"
          placeholder="Buscar local calmo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar local calmo"
        />
      </div>

      <div className="chips" role="group" aria-label="Filtros">
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            className={'chip' + (ativos.includes(f) ? ' ativo' : '')}
            aria-pressed={ativos.includes(f)}
            onClick={() => alternar(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mapa-box">
        <MapContainer center={CENTRO_RECIFE} zoom={13} scrollWheelZoom className="mapa">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visiveis.map((l) => (
            <Marker key={l.id} position={l.pos} icon={icone(l.nome)}>
              <Popup>
                <strong>{l.nome}</strong>
                <br />
                {l.endereco}
                <br />
                {l.tags.join(' · ')}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {visiveis.length === 0 && (
          <p className="mapa-vazio">Nenhum local encontrado. Tente tirar algum filtro.</p>
        )}
      </div>
    </section>
  )
}
