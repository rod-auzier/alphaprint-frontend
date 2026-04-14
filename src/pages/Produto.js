import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarProduto } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCarrinho } from '../context/CarrinhoContext';

function Produto() {
  const [produto, setProduto] = useState(null);
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState('');

  const { id } = useParams();
  const { usuario } = useAuth();
  const { adicionarItem } = useCarrinho();
  const navigate = useNavigate();

  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await buscarProduto(id);
        setProduto(dados);
        if (dados.variacoes?.length > 0) {
          setVariacaoSelecionada(dados.variacoes[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [id]);

  const handleAdicionarCarrinho = () => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    adicionarItem(produto, variacaoSelecionada);
    setMensagem('Produto adicionado ao carrinho!');
    setTimeout(() => setMensagem(''), 2000);
  };

  const handleComprar = () => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    adicionarItem(produto, variacaoSelecionada);
    navigate('/carrinho');
  };

  if (carregando) return <p>Carregando...</p>;
  if (!produto) return <p>Produto não encontrado.</p>;

  return (
    <div>
      <h1>{produto.nome}</h1>
      <p>{produto.categoria}</p>
      <p>{produto.descricao}</p>

      {produto.variacoes?.length > 0 && (
        <div>
          <h3>Variações</h3>
          {produto.variacoes.map((variacao) => (
            <button
              key={variacao._id}
              onClick={() => setVariacaoSelecionada(variacao)}
              style={{
                fontWeight: variacaoSelecionada?._id === variacao._id ? 'bold' : 'normal'
              }}
            >
              {variacao.nome} - R$ {variacao.preco.toFixed(2)}
            </button>
          ))}
        </div>
      )}

      <h2>
        R$ {variacaoSelecionada
          ? variacaoSelecionada.preco.toFixed(2)
          : produto.preco.toFixed(2)}
      </h2>

      {produto.gabarito && (
        <a href={produto.gabarito} target="_blank" rel="noreferrer">
          Baixar gabarito
        </a>
      )}

      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}

      <div>
        <button onClick={handleComprar}>Comprar</button>
        <button onClick={handleAdicionarCarrinho}>Adicionar ao carrinho</button>
      </div>
    </div>
  );
}

export default Produto;