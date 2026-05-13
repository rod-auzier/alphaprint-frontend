import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { listarProdutos } from '../services/api';
import '../styles/Home.css';

function Home() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const buscaParam = params.get('busca') || '';
  const categoriaParam = params.get('categoria') || '';

  useEffect(() => {
    carregarProdutos({ busca: buscaParam, categoria: categoriaParam });
  }, [location.search]);

  const carregarProdutos = async (filtros = {}) => {
    setCarregando(true);
    try {
      const dados = await listarProdutos(filtros);
      setProdutos(dados);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setCarregando(false);
    }
  };

  const temFiltro = buscaParam || categoriaParam;

  return (
    <div className="home-container">
      {temFiltro && (
        <div className="home-filtros-ativos">
          {categoriaParam && <span className="home-filtro-tag">📂 {categoriaParam}</span>}
          {buscaParam && <span className="home-filtro-tag">🔍 "{buscaParam}"</span>}
          <button className="home-limpar-busca" onClick={() => navigate('/')}>✕ Limpar filtros</button>
        </div>
      )}

      {carregando ? (
        <p className="home-carregando">Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p className="home-vazio">Nenhum produto encontrado.</p>
      ) : (
        <div className="produtos-grid">
          {produtos.map((produto) => (
            <div
              key={produto._id}
              className="produto-card"
              onClick={() => navigate(`/produto/${produto._id}`)}
            >
              {produto.fotos?.length > 0 ? (
                <img src={produto.fotos[0]} alt={produto.nome} className="produto-card-img" />
              ) : (
                <div className="produto-card-img-placeholder">Sem foto</div>
              )}
              <div className="produto-card-info">
                <p className="produto-card-categoria">{produto.categoria}</p>
                <p className="produto-card-nome">{produto.nome}</p>
                <p className="produto-card-preco">R$ {produto.preco.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;