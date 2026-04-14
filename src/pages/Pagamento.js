import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import { useAuth } from '../context/AuthContext';
import { calcularFrete } from '../services/api';

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
        quantidade: item.quantidade
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
        navigate('/meus-pedidos');
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
      <div>
        <h1>Pagamento</h1>
        <p>Seu carrinho está vazio.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Pagamento</h1>

      <h2>Resumo do pedido</h2>
      {itens.map((item, index) => (
        <div key={index}>
          <p>{item.produto.nome} {item.variacao && `- ${item.variacao.nome}`} x{item.quantidade}</p>
          <p>R$ {((item.variacao ? item.variacao.preco : item.produto.preco) * item.quantidade).toFixed(2)}</p>
        </div>
      ))}
      <p>Subtotal: R$ {total.toFixed(2)}</p>

      <h2>Endereço de entrega</h2>
      {usuario?.endereco?.rua ? (
        <p>{usuario.endereco.rua}, {usuario.endereco.numero} - {usuario.endereco.bairro}, {usuario.endereco.cidade} - {usuario.endereco.estado}</p>
      ) : (
        <p>Nenhum endereço cadastrado.</p>
      )}

      <h2>Frete</h2>
      {carregandoFrete ? (
        <p>Calculando frete...</p>
      ) : freteOpcoes.length > 0 ? (
        <div>
          {freteOpcoes.map((opcao, index) => (
            <label key={index}>
              <input
                type="radio"
                value={opcao.servico}
                checked={freteSelecionado?.servico === opcao.servico}
                onChange={() => setFreteSelecionado(opcao)}
              />
              {opcao.servico} — R$ {opcao.valor.toFixed(2)} ({opcao.prazo})
            </label>
          ))}
        </div>
      ) : (
        <p>Frete a calcular — endereço não cadastrado.</p>
      )}

      <h2>Forma de pagamento</h2>
      <div>
        <label>
          <input type="radio" value="pix" checked={metodoPagamento === 'pix'} onChange={(e) => setMetodoPagamento(e.target.value)} />
          PIX
        </label>
        <label>
          <input type="radio" value="cartao" checked={metodoPagamento === 'cartao'} onChange={(e) => setMetodoPagamento(e.target.value)} />
          Cartão de crédito
        </label>
        <label>
          <input type="radio" value="boleto" checked={metodoPagamento === 'boleto'} onChange={(e) => setMetodoPagamento(e.target.value)} />
          Boleto
        </label>
      </div>

      <h2>Total: R$ {totalComFrete.toFixed(2)}</h2>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <button onClick={handleConfirmar} disabled={carregando}>
        {carregando ? 'Confirmando...' : 'Confirmar pedido'}
      </button>
    </div>
  );
}

export default Pagamento;