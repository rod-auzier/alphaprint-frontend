import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import { useAuth } from '../context/AuthContext';
import { calcularFrete } from '../services/api';
import '../styles/Pagamento.css';

function Pagamento() {
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [freteOpcoes, setFreteOpcoes] = useState([]);
  const [freteSelecionado, setFreteSelecionado] = useState(null);
  const [carregandoFrete, setCarregandoFrete] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const { itens, total, limparCarrinho } = useCarrinho();
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario?.endereco?.cep) {
      buscarFrete(usuario.endereco.cep);
    }
  }, [usuario]);

  const buscarFrete = async (cep) => {
    setCarregandoFrete(true);
    try {
      const dados = await calcularFrete(cep);
      if (dados.opcoes) {
        setFreteOpcoes(dados.opcoes);
        setFreteSelecionado(dados.opcoes[0]);
      }
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
    } finally {
      setCarregandoFrete(false);
    }
  };

  const handleConfirmar = async () => {
    setErro('');
    setCarregando(true);
    try {
      const itensPedido = itens.map((item) => ({
        produto: item.produto._id,
        nome: item.produto.nome,
        variacao: item.variacao?.nome || '',
        preco: item.variacao ? item.variacao.preco : item.produto.preco,
        quantidade: item.quantidade,
        urlArte: item.urlArte || ''
      }));

      const response = await fetch('http://localhost:5000/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itens: itensPedido,
          pagamento: { metodo: metodoPagamento },
          frete: freteSelecionado
            ? { valor: freteSelecionado.valor, prazo: freteSelecionado.prazo }
            : { valor: 0, prazo: 'A calcular' }
        })
      });

      const pedido = await response.json();
      if (pedido._id) {
        limparCarrinho();
        navigate('/pedido-confirmado', { state: { pedido } });
      } else {
        setErro(pedido.mensagem || 'Erro ao criar pedido');
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setCarregando(false);
    }
  };

  const totalComFrete = total + (freteSelecionado?.valor || 0);

  if (itens.length === 0) {
    return (
      <div className="pagamento-container">
        <p style={{ color: '#888', padding: '40px' }}>Seu carrinho está vazio.</p>
      </div>
    );
  }

  return (
    <div className="pagamento-container">
      <div className="pagamento-layout">

        {/* COLUNA ESQUERDA */}
        <div className="pagamento-esquerda">

          {/* CONTATO */}
          <div className="pagamento-secao">
            <div className="pagamento-secao-header">
              <span className="pagamento-secao-icone">👤</span>
              <h2 className="pagamento-secao-titulo">Contato</h2>
            </div>
            <div className="pagamento-contato-grid">
              <div className="pagamento-contato-item">
                <span className="pagamento-contato-label">Nome</span>
                <span className="pagamento-contato-valor">{usuario?.nome}</span>
              </div>
              <div className="pagamento-contato-item">
                <span className="pagamento-contato-label">E-mail</span>
                <span className="pagamento-contato-valor">{usuario?.email}</span>
              </div>
              <div className="pagamento-contato-item">
                <span className="pagamento-contato-label">CPF</span>
                <span className="pagamento-contato-valor">{usuario?.cpf || '—'}</span>
              </div>
            </div>
          </div>

          {/* ENTREGA */}
          <div className="pagamento-secao">
            <div className="pagamento-secao-header">
              <span className="pagamento-secao-icone">📦</span>
              <h2 className="pagamento-secao-titulo">Endereço de Entrega</h2>
            </div>
            {usuario?.endereco?.rua ? (
              <div className="pagamento-endereco">
                <p>{usuario.endereco.rua}, {usuario.endereco.numero}{usuario.endereco.complemento && ` - ${usuario.endereco.complemento}`}</p>
                <p>{usuario.endereco.bairro} — {usuario.endereco.cidade} / {usuario.endereco.estado}</p>
                <p>CEP: {usuario.endereco.cep}</p>
              </div>
            ) : (
              <p className="pagamento-aviso">Nenhum endereço cadastrado. <a href="/perfil">Cadastrar endereço</a></p>
            )}

            {/* FRETE */}
            <div className="pagamento-frete">
              <h3 className="pagamento-frete-titulo">Método de Envio</h3>
              {carregandoFrete ? (
                <p className="pagamento-aviso">Calculando frete...</p>
              ) : freteOpcoes.length > 0 ? (
                <div className="pagamento-frete-opcoes">
                  {freteOpcoes.map((opcao, index) => (
                    <label
                      key={index}
                      className={`pagamento-frete-opcao ${freteSelecionado?.servico === opcao.servico ? 'selecionada' : ''}`}
                    >
                      <input
                        type="radio"
                        value={opcao.servico}
                        checked={freteSelecionado?.servico === opcao.servico}
                        onChange={() => setFreteSelecionado(opcao)}
                      />
                      <div className="pagamento-frete-info">
                        <span className="pagamento-frete-nome">{opcao.servico}</span>
                        <span className="pagamento-frete-prazo">{opcao.prazo}</span>
                      </div>
                      <span className="pagamento-frete-valor">R$ {opcao.valor.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="pagamento-aviso">Frete a calcular — cadastre seu endereço.</p>
              )}
            </div>
          </div>

          {/* PAGAMENTO */}
          <div className="pagamento-secao">
            <div className="pagamento-secao-header">
              <span className="pagamento-secao-icone">💳</span>
              <h2 className="pagamento-secao-titulo">Forma de Pagamento</h2>
            </div>
            <div className="pagamento-metodos">
              {[
                { value: 'pix', label: 'PIX', desc: 'Aprovação imediata' },
                { value: 'cartao', label: 'Cartão de Crédito', desc: 'Até 12x' },
                { value: 'boleto', label: 'Boleto Bancário', desc: 'Vence em 3 dias úteis' },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`pagamento-metodo-opcao ${metodoPagamento === m.value ? 'selecionada' : ''}`}
                >
                  <input
                    type="radio"
                    value={m.value}
                    checked={metodoPagamento === m.value}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                  />
                  <div className="pagamento-metodo-info">
                    <span className="pagamento-metodo-nome">{m.label}</span>
                    <span className="pagamento-metodo-desc">{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {erro && <p className="pagamento-erro">{erro}</p>}
        </div>

        {/* COLUNA DIREITA — RESUMO */}
        <div className="pagamento-resumo">
          <h2 className="pagamento-resumo-titulo">Resumo do Pedido</h2>

          <div className="pagamento-resumo-itens">
            {itens.map((item, index) => {
              const preco = item.variacao ? item.variacao.preco : item.produto.preco;
              const foto = item.produto.fotos?.[0];
              return (
                <div key={index} className="pagamento-resumo-item">
                  {foto && <img src={foto} alt={item.produto.nome} className="pagamento-resumo-item-foto" />}
                  <div className="pagamento-resumo-item-info">
                    <span className="pagamento-resumo-item-nome">{item.produto.nome}</span>
                    {item.variacao && <span className="pagamento-resumo-item-var">{item.variacao.nome}</span>}
                    <span className="pagamento-resumo-item-qtd">Qtd: {item.quantidade}</span>
                  </div>
                  <span className="pagamento-resumo-item-preco">R$ {(preco * item.quantidade).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="pagamento-resumo-linha">
            <span>Subtotal</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <div className="pagamento-resumo-linha">
            <span>Frete</span>
            <span>{freteSelecionado ? `R$ ${freteSelecionado.valor.toFixed(2)}` : 'A calcular'}</span>
          </div>
          <div className="pagamento-resumo-total">
            <span>Total</span>
            <span>R$ {totalComFrete.toFixed(2)}</span>
          </div>

          <button
            className="pagamento-btn-confirmar"
            onClick={handleConfirmar}
            disabled={carregando}
          >
            {carregando ? 'Confirmando...' : '✓ Finalizar Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagamento;