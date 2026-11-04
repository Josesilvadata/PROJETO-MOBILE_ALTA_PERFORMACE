import { useState } from 'react'
import './App.css'
import MapaCalmo from './MapaCalmo'

const API = 'http://localhost:8080'

function Form({ titulo, campos, botao, voltar, endpoint }) {
  const [msg, setMsg] = useState('')
  const enviar = async (e) => {
    e.preventDefault()
    const dados = Object.fromEntries(new FormData(e.target))
    try {
      const r = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      setMsg(r.ok ? 'Sucesso!' : 'Erro ' + r.status)
    } catch {
      setMsg('Não consegui falar com o servidor.')
    }
  }
  return (
    <form className="card" onSubmit={enviar}>
      <h1>{titulo}</h1>
      {campos.map(([chave, tipo, label]) => (
        <input key={chave} name={chave} type={tipo} placeholder={label} required />
      ))}
      <button className="btn">{botao}</button>
      <p className="msg">{msg}</p>
      <button type="button" className="link" onClick={voltar}>Voltar</button>
    </form>
  )
}

export default function App() {
  const [tela, setTela] = useState('menu')
  const voltar = () => setTela('inicio')
  return (
    <>
      <header>
        <b>SensiCare</b>
        {tela !== 'menu' && <button className="btn ghost" onClick={() => setTela('menu')}>Menu</button>}
      </header>
      <main>
        {tela === 'menu' && (
          <div className="card">
            <h1>Menu</h1>
            <p>Escolha uma opção para continuar.</p>
            <button className="btn" onClick={() => setTela('inicio')}>Início</button>
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
          <Form titulo="Login" botao="Entrar" voltar={voltar} endpoint="/api/login"
            campos={[['email', 'email', 'E-mail'], ['senha', 'password', 'Senha']]} />
        )}
        {tela === 'cadastro' && (
          <Form titulo="Cadastro" botao="Cadastrar" voltar={voltar} endpoint="/api/cadastro"
            campos={[['nome', 'text', 'Nome'], ['email', 'email', 'E-mail'], ['senha', 'password', 'Senha']]} />
        )}
        {tela === 'mapa' && <MapaCalmo />}
      </main>
    </>
  )
}