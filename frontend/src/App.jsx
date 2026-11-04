import { useState } from 'react'
import './App.css'
import MapaCalmo from './MapaCalmo'

function Form({ titulo, campos, botao, voltar }) {
  const [msg, setMsg] = useState('')
  const enviar = (e) => { e.preventDefault(); setMsg('mensagem genérica aq') }
  return (
    <form className="card" onSubmit={enviar}>
      <h1>{titulo}</h1>
      {campos.map(([nome, tipo]) => <input key={nome} type={tipo} placeholder={nome} required />)}
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
          <Form titulo="Login" botao="Entrar" voltar={voltar}
            campos={[['E-mail', 'email'], ['Senha', 'password']]} />
        )}
        {tela === 'cadastro' && (
          <Form titulo="Cadastro" botao="Cadastrar" voltar={voltar}
            campos={[['Nome', 'text'], ['E-mail', 'email'], ['Senha', 'password']]} />
        )}
        {tela === 'mapa' && <MapaCalmo />}
      </main>
    </>
  )
}
