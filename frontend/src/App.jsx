import { useEffect, useState } from 'react'
import './App.css'
import MapaCalmo from './MapaCalmo'
import { cadastrar, login, me, sair, getToken } from './api'

function Form({ titulo, campos, botao, voltar, aoEnviar }) {
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const dados = Object.fromEntries(new FormData(form))
    setMsg('')
    setErro(false)
    setCarregando(true)
    try {
      const texto = await aoEnviar(dados)
      if (texto) {
        setMsg(texto)
        form.reset()
      }
    } catch (err) {
      setErro(true)
      setMsg(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form className="card" onSubmit={enviar}>
      <h1>{titulo}</h1>
      {campos.map(([placeholder, tipo, chave]) => (
        <input key={chave} name={chave} type={tipo} placeholder={placeholder} required />
      ))}
      <button className="btn" disabled={carregando}>
        {carregando ? 'Aguarde...' : botao}
      </button>
      <p className="msg" style={erro ? { color: '#c0392b' } : undefined}>{msg}</p>
      <button type="button" className="link" onClick={voltar}>Voltar</button>
    </form>
  )
}

export default function App() {
  const [tela, setTela] = useState('menu')
  const [usuario, setUsuario] = useState(null)
  const voltar = () => setTela('inicio')

  // ao abrir o site, se já há token, confirma com o back-end quem é o usuário
  useEffect(() => {
    if (getToken()) {
      me().then((u) => setUsuario(u.nome)).catch(() => {})
    }
  }, [])

  // se o token vencer em qualquer chamada, volta pro estado deslogado
  useEffect(() => {
    const aoExpirar = () => {
      setUsuario(null)
      setTela('login')
    }
    window.addEventListener('sessao-expirada', aoExpirar)
    return () => window.removeEventListener('sessao-expirada', aoExpirar)
  }, [])

  const fazerLogin = async (dados) => {
    const data = await login(dados)
    setUsuario(data.nome)
    setTela('menu') // redireciona depois do login
  }

  const fazerCadastro = async (dados) => {
    await cadastrar(dados)
    return 'Cadastro realizado! Agora faça o login.'
  }

  const fazerLogout = () => {
    sair()
    setUsuario(null)
    setTela('menu')
  }

  return (
    <>
      <header>
        <b>SensiCare</b>
        <div>
          {usuario && <span>Olá, {usuario} </span>}
          {usuario && <button className="btn ghost" onClick={fazerLogout}>Sair</button>}
          {tela !== 'menu' && <button className="btn ghost" onClick={() => setTela('menu')}>Menu</button>}
        </div>
      </header>
      <main>
        {tela === 'menu' && (
          <div className="card">
            <h1>Menu</h1>
            <p>{usuario ? `Bem-vindo, ${usuario}!` : 'Escolha uma opção para continuar.'}</p>
            {!usuario && <button className="btn" onClick={() => setTela('inicio')}>Início</button>}
            <button className="btn ghost" onClick={() => setTela('mapa')}>Mapa Calmo</button>
          </div>
        )}
        {tela === 'inicio' && (
          <div className="card">
            <h1>Início</h1>
            <p>Entre na sua conta ou crie uma nova.</p>
            <button className="btn" onClick={() => setTela('login')}>Login</button>
            <button className="btn ghost" onClick={() => setTela('cadastro')}>Cadastro</button>
          </div>
        )}
        {tela === 'login' && (
          <Form titulo="Login" botao="Entrar" voltar={voltar} aoEnviar={fazerLogin}
            campos={[['E-mail', 'email', 'email'], ['Senha', 'password', 'senha']]} />
        )}
        {tela === 'cadastro' && (
          <Form titulo="Cadastro" botao="Cadastrar" voltar={voltar} aoEnviar={fazerCadastro}
            campos={[['Nome', 'text', 'nome'], ['E-mail', 'email', 'email'], ['Senha', 'password', 'senha']]} />
        )}
        {tela === 'mapa' && <MapaCalmo />}
      </main>
    </>
  )
}