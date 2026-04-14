const API_URL = 'http://localhost:5000';

export const cadastrar = async (dados) => {
  const response = await fetch(`${API_URL}/api/auth/cadastrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return response.json();
};

export const login = async (dados) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return response.json();
};

export const listarProdutos = async (filtros = {}) => {
  const params = new URLSearchParams(filtros);
  const response = await fetch(`${API_URL}/api/produtos?${params}`);
  return response.json();
};

export const buscarProduto = async (id) => {
  const response = await fetch(`${API_URL}/api/produtos/${id}`);
  return response.json();
};

export const criarProduto = async (dados, token) => {
  const response = await fetch(`${API_URL}/api/produtos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(dados)
  });
  return response.json();
};