import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarProduto } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCarrinho } from '../context/CarrinhoContext';
import '../styles/Produto.css';

function Produto() {
  const [produto, setProduto] = useState(null);
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [mensagemTipo, setMensagemTipo] = useState('sucesso');
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
    if (!usuario) { navigate('/login'); return; }
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
        setMensagem('Arte enviada com sucesso! Agora você pode adicionar ao carrinho.');
        setMensagemTipo('sucesso');
        setTimeout(() => setMensagem(''), 4000);
      }
    } catch (err) {
      setMensagem('Erro ao enviar arte.');
      setMensagemTipo('erro');
    } finally {
      setUploadando(false);
    }
  };

  const handleAdicionarCarrinho = () => {
    if (!usuario) { navigate('/login'); return; }
    if (!urlArte) {
      setMensagem('Envie sua arte antes de adicionar ao carrinho.');
      setMensagemTipo('erro');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }
    adicionarItem(produto, variacaoSelecionada, urlArte);
    setMensagem('Produto adicionado ao carrinho!');
    setMensagemTipo('sucesso');
    setTimeout(() => setMensagem(''), 2000);
  };

  const handleComprar = () => {
    if (!usuario) { navigate('/login'); return; }
    if (!urlArte) {
      setMensagem('Envie sua arte antes de comprar.');
      setMensagemTipo('erro');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }
    adicionarItem(produto, variacaoSelecionada, urlArte);
    navigate('/carrinho');
  };

  if (carregando) return <p style={{ padding: '40px', color: '#888' }}>Carregando...</p>;
  if (!produto) return <p style={{ padding: '40px', color: '#888' }}>Produto não encontrado.</p>;

  const preco = variacaoSelecionada ? variacaoSelecionada.preco : produto.preco;

  return (
    <div className="produto-container">
      <div className="produto-layout">

        {/* COLUNA ESQUERDA - IMAGEM */}
        <div className="produto-galeria">
          {produto.fotos?.length > 0 ? (
            <img src={produto.fotos[0]} alt={produto.nome} className="produto-foto-principal" />
          ) : (
            <div className="produto-foto-placeholder">Sem foto</div>
          )}
        </div>

        {/* COLUNA DIREITA - INFOS */}
        <div className="produto-info">
          <p className="produto-categoria">{produto.categoria}</p>
          <h1 className="produto-nome">{produto.nome}</h1>
          {produto.descricao && <p className="produto-descricao">{produto.descricao}</p>}

          <div className="produto-preco">R$ {preco.toFixed(2)}</div>

          {/* VARIAÇÕES */}
          {produto.variacoes?.length > 0 && (
            <div className="produto-variacoes">
              <p className="produto-variacoes-titulo">Tamanho / Variação</p>
              <div className="produto-variacoes-lista">
                {produto.variacoes.map((variacao) => (
                  <button
                    key={variacao._id}
                    className={`produto-variacao-btn ${variacaoSelecionada?._id === variacao._id ? 'ativa' : ''}`}
                    onClick={() => setVariacaoSelecionada(variacao)}
                  >
                    {variacao.nome}
                    <span className="produto-variacao-preco">R$ {variacao.preco.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GABARITO */}
          {produto.gabarito && (
            <a href={produto.gabarito} target="_blank" rel="noreferrer" className="produto-gabarito-link">
              📐 Baixar gabarito
            </a>
          )}

          {/* UPLOAD DE ARTE */}
          <div className={`produto-arte-box ${urlArte ? 'enviada' : ''}`}>
            <div className="produto-arte-header">
              <span className="produto-arte-titulo">
                {urlArte ? '✓ Arte enviada' : '📎 Enviar arte'}
              </span>
              {urlArte && (
                <a href={urlArte} target="_blank" rel="noreferrer" className="produto-arte-ver">
                  Ver arquivo
                </a>
              )}
            </div>

            {!urlArte && (
              <>
                <p className="produto-arte-desc">
                  Formato aceito: PDF
                </p>
                <div className="produto-arte-upload">
                  <input
                    type="file"
                    id="upload-arte"
                    accept=".pdf"
                    onChange={(e) => setArte(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="upload-arte" className="produto-arte-label">
                    {arte ? `📄 ${arte.name}` : 'Escolher arquivo'}
                  </label>
                  {arte && (
                    <button
                      className="produto-arte-enviar"
                      onClick={handleUploadArte}
                      disabled={uploadando}
                    >
                      {uploadando ? 'Enviando...' : 'Enviar'}
                    </button>
                  )}
                </div>
              </>
            )}

            {!urlArte && (
              <p className="produto-arte-aviso">
                ⚠ O envio da arte é obrigatório para finalizar a compra.
              </p>
            )}
          </div>

          {/* MENSAGEM */}
          {mensagem && (
            <p className={`produto-mensagem ${mensagemTipo}`}>{mensagem}</p>
          )}

          {/* BOTÕES */}
          <div className="produto-acoes">
            <button
              className={`produto-btn-comprar ${!urlArte ? 'bloqueado' : ''}`}
              onClick={handleComprar}
              title={!urlArte ? 'Envie sua arte primeiro' : ''}
            >
              Comprar agora
            </button>
            <button
              className={`produto-btn-carrinho ${!urlArte ? 'bloqueado' : ''}`}
              onClick={handleAdicionarCarrinho}
              title={!urlArte ? 'Envie sua arte primeiro' : ''}
            >
              Adicionar ao carrinho
            </button>
          </div>

          {!urlArte && (
            <p className="produto-btn-aviso">Envie sua arte para liberar os botões de compra.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Produto;