import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// [API] endereço do back-end (vem da versão com API)
const API = 'http://localhost:8080'

// ORIGINAL: lista fixa de locais, substituída pelos dados do back-end
// const LOCAIS = [
//   { id: 1, nome: 'Café Romã', endereco: 'Rua das Flores, 42', pos: [-8.0632, -34.8712], tags: ['Baixo ruído', 'Luz suave'] },
//   { id: 2, nome: 'Biblioteca Parque', endereco: 'Alameda Verde, 120', pos: [-8.0556, -34.8815], tags: ['Baixo ruído', 'Sem multidão'] },
//   { id: 3, nome: 'Parque da Jaqueira', endereco: 'Rua Madre de Deus, s/n', pos: [-8.0366, -34.9027], tags: ['Sem multidão', 'Espaço aberto'] },
//   { id: 4, nome: 'Jardim da Praça', endereco: 'Av. Conde da Boa Vista, 500', pos: [-8.0585, -34.8890], tags: ['Luz suave', 'Espaço aberto'] },
// ]

const FILTROS = ['Baixo ruído', 'Luz suave', 'Sem multidão', 'Espaço aberto']
const CENTRO_RECIFE = [-8.0476, -34.877]

// ORIGINAL: ícone com o nome do local escrito no mapa (gerava os "borrões")
// const icone = (nome) =>
//   L.divIcon({
//     className: 'pin',
//     html: `<span class="pin-label">${nome}</span><span class="pin-dot"></span>`,
//     iconSize: [0, 0],
//   })

// ícone 📍 único, reaproveitado por todos os locais (sem texto, bem mais leve)
const ICONE_PIN = L.divIcon({
  className: 'pin-emoji',
  html: '📍',
  iconSize: [24, 24],
  iconAnchor: [12, 24],   // a ponta do pin fica sobre a coordenada
  popupAnchor: [0, -24],  // o popup abre acima do pin
})

// Distância em km entre dois pontos [lat, lon] (fórmula de Haversine)
function distanciaKm([lat1, lon1], [lat2, lon2]) {
  const r = (g) => (g * Math.PI) / 180
  const a =
    Math.sin(r(lat2 - lat1) / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(a))
}

const formatar = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`

// Move o mapa até o lugar escolhido no card
function Foco({ alvo }) {
  const mapa = useMap()
  useEffect(() => {
    if (alvo) mapa.flyTo(alvo.pos, 16)
  }, [alvo, mapa])
  return null
}

// ORIGINAL: export default function MapaCalmo() {
// [FAVORITOS] recebe do App: se há usuário logado, a lista de favoritos e a função de marcar/desmarcar
export default function MapaCalmo({ logado = false, favoritos = [], alternarFavorito }) {
  const [busca, setBusca] = useState('')
  const [ativos, setAtivos] = useState([])
  const [minhaPos, setMinhaPos] = useState(CENTRO_RECIFE)
  const [temGps, setTemGps] = useState(false)
  const [alvo, setAlvo] = useState(null)

  // [API] locais vindos do back-end + estados de carregamento e erro
  const [locais, setLocais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  // [API] busca os locais no servidor ao abrir a tela
  useEffect(() => {
    fetch(API + '/api/locais')
      .then((r) => {
        if (!r.ok) throw new Error('erro')
        return r.json()
      })
      .then((dados) => setLocais(dados))
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }, [])

  // Pede a localização da pessoa. Se ela negar, usa o centro do Recife.
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        setMinhaPos([p.coords.latitude, p.coords.longitude])
        setTemGps(true)
      },
      () => {}
    )
  }, [])

  const alternar = (f) =>
    setAtivos((a) => (a.includes(f) ? a.filter((x) => x !== f) : [...a, f]))

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    // ORIGINAL do colega: return LOCAIS.filter(...)  -> agora usa "locais" (da API)
    return locais
      .filter(
        (l) =>
          (!termo ||
            l.nome.toLowerCase().includes(termo) ||
            (l.endereco || l.descricao || '').toLowerCase().includes(termo)) &&
          ativos.every((f) => (l.tags || []).includes(f))
      )
      .map((l) => ({ ...l, km: distanciaKm(minhaPos, l.pos) }))
      .sort((a, b) => a.km - b.km)
  }, [locais, busca, ativos, minhaPos])

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

      <div className="mapa-conteudo">
        <div className="mapa-box">
          <MapContainer center={CENTRO_RECIFE} zoom={13} scrollWheelZoom className="mapa">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Foco alvo={alvo} />
            {temGps && (
              <CircleMarker center={minhaPos} radius={8} pathOptions={{ color: '#1b6ca8', fillColor: '#1b6ca8', fillOpacity: 1 }}>
                <Popup>Você está aqui</Popup>
              </CircleMarker>
            )}
            {visiveis.map((l) => (
              // ORIGINAL: <Marker key={l.id} position={l.pos} icon={icone(l.nome)}>
              <Marker key={l.id} position={l.pos} icon={ICONE_PIN}>
                <Popup>
                  <strong>{l.nome}</strong>
                  <br />
                  {l.endereco || l.descricao}
                  <br />
                  {(l.tags || []).join(' · ')}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* [API] avisos de carregando, erro e lista vazia */}
          {carregando && <p className="mapa-vazio">Carregando locais...</p>}
          {!carregando && erro && <p className="mapa-vazio">Não consegui carregar os locais.</p>}
          {!carregando && !erro && visiveis.length === 0 && (
            <p className="mapa-vazio">Nenhum local encontrado. Tente tirar algum filtro.</p>
          )}
        </div>

        <aside className="lista" aria-label="Lugares">
          <p className="lista-info">
            {temGps ? 'Distância a partir da sua localização' : 'Distância a partir do centro do Recife'}
          </p>
          {visiveis.map((l) => (
            <article className="lugar-card" key={l.id}>
              <div className="lugar-topo">
                <h2>{l.nome}</h2>
                <span className="lugar-dist">{formatar(l.km)}</span>
              </div>
              <p>{l.endereco || l.descricao}</p>
              <div className="lugar-tags">
                {(l.tags || []).map((t) => <span key={t}>{t}</span>)}
              </div>
              <button className="btn ghost" onClick={() => setAlvo({ pos: l.pos })}>
                Ver no mapa
              </button>
              {/* [FAVORITOS] só aparece para quem está logado; fica preenchido se já é favorito */}
              {logado && (
                <button
                  className={'btn' + (favoritos.some((f) => f.id === l.id) ? '' : ' ghost')}
                  onClick={() => alternarFavorito(l)}
                >
                  {favoritos.some((f) => f.id === l.id) ? '♥ Favoritado' : '♡ Favoritar'}
                </button>
              )}
            </article>
          ))}
        </aside>
      </div>
    </section>
  )
}