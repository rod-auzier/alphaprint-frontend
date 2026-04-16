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
  const [arte, setArte] = useState(null);
  const [urlArte, setUrlArte] = useState('');
  const [uploadando, setUploadando] = useState(false);

  const { id } = useParams();
  const { usuario, token } = useAuth();
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

  const handleUploadArte = async () => {
    if (!arte) return;
    if (!usuario) {
      navigate('/login');
      return;
    }

    setUploadando(true);
    try {
      const formData = new FormData();
      formData.append('arte', arte);

      const response = await fetch('http://localhost:5000/api/upload/arte', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const dados = await response.json();
      if (dados.url) {
        setUrlArte(dados.url);
        setMensagem('Arte enviada com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
      }
    } catch (err) {
      setMensagem('Erro ao enviar arte');
    } finally {
      setUploadando(false);
    }
  };

  const handleAdicionarCarrinho = () => {
  if (!usuario) {
    navigate('/login');
    return;
  }
  adicionarItem(produto, variacaoSelecionada, urlArte);
  setMensagem('Produto adicionado ao carrinho!');
  setTimeout(() => setMensagem(''), 2000);
};

const handleComprar = () => {
  if (!usuario) {
    navigate('/login');
    return;
  }
  adicionarItem(produto, variacaoSelecionada, urlArte);
  navigate('/carrinho');
};

  if (carregando) return <p>Carregando...</p>;
  if (!produto) return <p>Produto não encontrado.</p>;

  return (
    <div>
      <h1>{produto.nome}</h1>
      {produto.fotos?.length > 0 && (
  <div>
    {produto.fotos.map((foto, index) => (
      <img key={index} src={foto} alt={produto.nome} style={{ width: '300px', marginRight: '10px' }} />
    ))}
  </div>
)}
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

      <div>
        <h3>Enviar arte</h3>
        <p>Formatos aceitos: JPG, PNG, PDF, AI, PSD</p>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.ai,.psd"
          onChange={(e) => setArte(e.target.files[0])}
        />
        {arte && (
          <button onClick={handleUploadArte} disabled={uploadando}>
            {uploadando ? 'Enviando...' : 'Enviar arte'}
          </button>
        )}
        {urlArte && <p style={{ color: 'green' }}>✓ Arte enviada</p>}
      </div>

      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}

      <div>
        <button onClick={handleComprar}>Comprar</button>
        <button onClick={handleAdicionarCarrinho}>Adicionar ao carrinho</button>
      </div>
    </div>
  );
}

export default Produto;