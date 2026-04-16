import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

function Header() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef(null);

  const handleSair = () => {
    sair();
    navigate('/');
    setDropdownAberto(false);
  };

  useEffect(() => {
    const handleClickFora = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        Alpha<span>Print</span>
      </Link>

      <nav className="header-nav">
        {usuario ? (
          <>
            {usuario.role === 'admin' && (
              <Link to="/admin" className="header-btn-admin">⚙️ Admin</Link>
            )}
            <Link to="/carrinho" className="header-btn-carrinho">🛒 Carrinho</Link>

            <div className="header-conta" ref={dropdownRef}>
              <button
                className="header-btn-conta"
                onClick={() => setDropdownAberto(!dropdownAberto)}
              >
                👤 {usuario.nome.split(' ')[0]} ▾
              </button>

              {dropdownAberto && (
                <div className="header-dropdown">
                  <div className="header-dropdown-nome">
                    Olá, {usuario.nome.split(' ')[0]}
                  </div>
                  <Link to="/perfil" className="header-dropdown-item" onClick={() => setDropdownAberto(false)}>
                    👤 Meus Dados
                  </Link>
                  <Link to="/meus-pedidos" className="header-dropdown-item" onClick={() => setDropdownAberto(false)}>
                    📦 Meus Pedidos
                  </Link>
                  <button className="header-dropdown-sair" onClick={handleSair}>
                    🚪 Sair
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="header-btn-entrar">Entrar</Link>
            <Link to="/cadastro" className="header-btn-cadastrar">Cadastrar</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;