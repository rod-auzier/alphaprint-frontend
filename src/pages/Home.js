import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listarProdutos } from '../services/api';
import '../styles/Home.css';

function Home() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarProdutos();
  }, []);

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

  const handleBusca = (e) => {
    e.preventDefault();
    carregarProdutos({ busca, categoria });
  };

  return (
    <div className="home-container">
      <h1 className="home-titulo">Produtos</h1>

      <form className="home-filtros" onSubmit={handleBusca}>
        <input
          type="text"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas as categorias</option>
          <option value="Banners">Banners</option>
          <option value="Adesivos">Adesivos</option>
          <option value="Impressos">Impressos</option>
        </select>
        <button type="submit">Buscar</button>
      </form>

      {carregando ? (
        <p className="home-carregando">Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p className="home-vazio">Nenhum produto encontrado.</p>
      ) : (
        <div className="produtos-grid">
          {produtos.map((produto) => (
            <div key={produto._id} className="produto-card">
              {produto.fotos?.length > 0 ? (
                <img src={produto.fotos[0]} alt={produto.nome} className="produto-card-img" />
              ) : (
                <div className="produto-card-img-placeholder">Sem foto</div>
              )}
              <div className="produto-card-info">
                <p className="produto-card-categoria">{produto.categoria}</p>
                <p className="produto-card-nome">{produto.nome}</p>
                <p className="produto-card-preco">R$ {produto.preco.toFixed(2)}</p>
                <Link to={`/produto/${produto._id}`} className="produto-card-btn">
                  Ver produto
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;