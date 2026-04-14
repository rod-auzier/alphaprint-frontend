import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';

function Carrinho() {
  const { itens, removerItem, atualizarQuantidade, total } = useCarrinho();
  const navigate = useNavigate();

  if (itens.length === 0) {
    return (
      <div>
        <h1>Carrinho</h1>
        <p>Seu carrinho está vazio.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Carrinho</h1>

      {itens.map((item, index) => (
        <div key={index}>
          <h3>{item.produto.nome}</h3>
          {item.variacao && <p>Variação: {item.variacao.nome}</p>}
          <p>Preço: R$ {(item.variacao ? item.variacao.preco : item.produto.preco).toFixed(2)}</p>
          <div>
            <button onClick={() => atualizarQuantidade(item.produto._id, item.variacao?.nome, item.quantidade - 1)}>-</button>
            <span>{item.quantidade}</span>
            <button onClick={() => atualizarQuantidade(item.produto._id, item.variacao?.nome, item.quantidade + 1)}>+</button>
          </div>
          <p>Subtotal: R$ {((item.variacao ? item.variacao.preco : item.produto.preco) * item.quantidade).toFixed(2)}</p>
          <button onClick={() => removerItem(item.produto._id, item.variacao?.nome)}>Remover</button>
        </div>
      ))}

      <h2>Total: R$ {total.toFixed(2)}</h2>
      <button onClick={() => navigate('/pagamento')}>Finalizar pedido</button>
    </div>
  );
}

export default Carrinho;