import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      buscarPerfil(token);
    }
  }, [token]);

  const buscarPerfil = async (t) => {
    try {
      const response = await fetch('http://localhost:5000/api/usuarios/perfil', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      const dados = await response.json();
      if (dados._id) {
        setUsuario(dados);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    }
  };

  const entrar = (dadosUsuario, dadosToken) => {
    setToken(dadosToken);
    localStorage.setItem('token', dadosToken);
    buscarPerfil(dadosToken);
  };

  const sair = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}