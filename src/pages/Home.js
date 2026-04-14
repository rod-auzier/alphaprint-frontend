import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listarProdutos } from '../services/api';

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
    <div>
      <h1>Produtos</h1>

      <form onSubmit={handleBusca}>
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
        <p>Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <div>
          {produtos.map((produto) => (
            <div key={produto._id}>
              <h3>{produto.nome}</h3>
              <p>{produto.categoria}</p>
              <p>R$ {produto.preco.toFixed(2)}</p>
              <Link to={`/produto/${produto._id}`}>Ver produto</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;