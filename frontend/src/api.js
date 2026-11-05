const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const getToken = () => localStorage.getItem('token')
export const sair = () => localStorage.removeItem('token')

async function request(path, options = {}) {
  const token = getToken()
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor')
  }

  const data = await res.json().catch(() => ({}))

  // token vencido ou inválido: limpa a sessão e avisa o App
  if (res.status === 401 && token) {
    sair()
    window.dispatchEvent(new Event('sessao-expirada'))
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  if (!res.ok) throw new Error(data.erro || 'Erro ao falar com o servidor')
  return data
}

export const cadastrar = (dados) =>
  request('/cadastro', { method: 'POST', body: JSON.stringify(dados) })

export async function login(dados) {
  const data = await request('/login', { method: 'POST', body: JSON.stringify(dados) })
  localStorage.setItem('token', data.token)
  return data
}

export const me = () => request('/me')