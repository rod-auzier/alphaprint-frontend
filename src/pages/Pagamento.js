import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import { useAuth } from '../context/AuthContext';

function Pagamento() {
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const { itens, total, limparCarrinho } = useCarrinho();
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

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
          frete: { valor: 0, prazo: 'A calcular' }
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

      <h3>Total: R$ {total.toFixed(2)}</h3>

      <h2>Endereço de entrega</h2>
      {usuario?.endereco ? (
        <p>
          {usuario.endereco.rua}, {usuario.endereco.numero} - {usuario.endereco.bairro}, {usuario.endereco.cidade} - {usuario.endereco.estado}
        </p>
      ) : (
        <p>Nenhum endereço cadastrado.</p>
      )}

      <h2>Forma de pagamento</h2>
      <div>
        <label>
          <input
            type="radio"
            value="pix"
            checked={metodoPagamento === 'pix'}
            onChange={(e) => setMetodoPagamento(e.target.value)}
          />
          PIX
        </label>
        <label>
          <input
            type="radio"
            value="cartao"
            checked={metodoPagamento === 'cartao'}
            onChange={(e) => setMetodoPagamento(e.target.value)}
          />
          Cartão de crédito
        </label>
        <label>
          <input
            type="radio"
            value="boleto"
            checked={metodoPagamento === 'boleto'}
            onChange={(e) => setMetodoPagamento(e.target.value)}
          />
          Boleto
        </label>
      </div>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <button onClick={handleConfirmar} disabled={carregando}>
        {carregando ? 'Confirmando...' : 'Confirmar pedido'}
      </button>
    </div>
  );
}

export default Pagamento;