import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  const handleSair = () => {
    sair();
    navigate('/');
  };

  return (
    <header>
      <Link to="/">AlphaPrint</Link>
      <nav>
        {usuario ? (
          <>
            <span>Olá, {usuario.nome}</span>
            <Link to="/carrinho">Carrinho</Link>
            <Link to="/meus-pedidos">Meus Pedidos</Link>
            {usuario.role === 'admin' && (
              <Link to="/admin">Admin</Link>
            )}
            <button onClick={handleSair}>Sair</button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/cadastro">Cadastrar</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;