import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const IconAdmin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z"/>
  </svg>
);

const IconCarrinho = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.5 6H20l-1.68 8.39a2 2 0 0 1-1.97 1.61H8.48a2 2 0 0 1-1.97-1.69L5.5 6zM3 2H1v2h2l3.6 7.59L5.25 14A2 2 0 0 0 7 17h13v-2H7.42a.25.25 0 0 1-.25-.21L8 13h9.28z"/>
  </svg>
);

const IconPerfil = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a1a1a" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>
);

const IconSair = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#e53e3e" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
);

const IconPedidos = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#333" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-2h11v2zm5-4H4v-2h16v2zm0-4H4V8h16v2z"/>
  </svg>
);

const IconDados = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#333" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>
);

const IconLupa = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#888" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 19.5l-4.05-4.05A7.5 7.5 0 1 0 15.5 17l4.05 4.05 1.45-1.55zM10.5 16a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
  </svg>
);

function Header() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [departamentosAberto, setDepartamentosAberto] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState('');
  const dropdownRef = useRef(null);
  const departamentosRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/categorias')
      .then(r => r.json())
      .then(data => setCategorias(Array.isArray(data) ? data.map(c => c.nome) : []))
      .catch(() => setCategorias([]));
  }, []);

  const handleSair = () => {
    sair();
    navigate('/');
    setDropdownAberto(false);
  };

  const handleBusca = (e) => {
    e.preventDefault();
    if (busca.trim()) {
      navigate(`/?busca=${encodeURIComponent(busca.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleCategoria = (cat) => {
    setDepartamentosAberto(false);
    navigate(`/?categoria=${encodeURIComponent(cat)}`);
  };

  useEffect(() => {
    const handleClickFora = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
      if (departamentosRef.current && !departamentosRef.current.contains(e.target)) {
        setDepartamentosAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  return (
    <header className="header">
      <div className="header-top">
        <Link to="/" className="header-logo">
          Alpha<span>Print</span>
        </Link>

        <form className="header-busca-form" onSubmit={handleBusca}>
          <input
            className="header-busca-input"
            type="text"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button className="header-busca-btn" type="submit">
            <IconLupa />
          </button>
        </form>

        <nav className="header-nav">
          {usuario ? (
            <>
              {usuario.role === 'admin' && (
                <Link to="/admin" className="header-btn-admin">
                  <IconAdmin /> Admin
                </Link>
              )}
              <Link to="/carrinho" className="header-btn-carrinho">
                <IconCarrinho /> Carrinho
              </Link>

              <div className="header-conta" ref={dropdownRef}>
                <button className="header-btn-conta" onClick={() => setDropdownAberto(!dropdownAberto)}>
                  <IconPerfil /> {usuario.nome.split(' ')[0]} ▾
                </button>
                {dropdownAberto && (
                  <div className="header-dropdown">
                    <div className="header-dropdown-nome">Olá, {usuario.nome.split(' ')[0]}</div>
                    <Link to="/perfil" className="header-dropdown-item" onClick={() => setDropdownAberto(false)}>
                      <IconDados /> Meus Dados
                    </Link>
                    <Link to="/meus-pedidos" className="header-dropdown-item" onClick={() => setDropdownAberto(false)}>
                      <IconPedidos /> Meus Pedidos
                    </Link>
                    <button className="header-dropdown-sair" onClick={handleSair}>
                      <IconSair /> Sair
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
      </div>

      {/* BARRA INFERIOR COM DEPARTAMENTOS */}
      <div className="header-bottom">
        <div className="header-bottom-inner">
          <div className="header-departamentos" ref={departamentosRef}>
            <button
              className="header-btn-departamentos"
              onClick={() => setDepartamentosAberto(!departamentosAberto)}
            >
              ☰ Categorias
            </button>
          </div>

          {/* OVERLAY */}
          {departamentosAberto && (
            <div className="header-overlay" onClick={() => setDepartamentosAberto(false)} />
          )}

          {/* MENU LATERAL */}
          <div className={`header-sidebar ${departamentosAberto ? 'aberto' : ''}`}>
            <div className="header-sidebar-header">
              <span className="header-sidebar-titulo">Categorias</span>
              <button className="header-sidebar-fechar" onClick={() => setDepartamentosAberto(false)}>✕</button>
            </div>
            {categorias.length === 0 ? (
              <span className="header-departamentos-vazio">Nenhuma categoria cadastrada</span>
            ) : (
              categorias.map((cat) => (
                <button
                  key={cat}
                  className="header-departamentos-item"
                  style={{ width: "100%", display: "block" }}
                  onClick={() => handleCategoria(cat)}
                >
                  {cat}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;