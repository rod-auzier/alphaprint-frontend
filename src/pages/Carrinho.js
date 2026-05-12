import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import '../styles/Carrinho.css';

function Carrinho() {
  const { itens, removerItem, atualizarQuantidade, total } = useCarrinho();
  const navigate = useNavigate();

  if (itens.length === 0) {
    return (
      <div className="carrinho-container">
        <h1 className="carrinho-titulo">Carrinho</h1>
        <div className="carrinho-vazio">
          <p>Seu carrinho está vazio.</p>
          <button onClick={() => navigate('/')}>Ver produtos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="carrinho-container">
      <h1 className="carrinho-titulo">Carrinho</h1>

      <div className="carrinho-layout">
        {/* ITENS */}
        <div className="carrinho-itens">
          {itens.map((item, index) => {
            const preco = item.variacao ? item.variacao.preco : item.produto.preco;
            const subtotal = preco * item.quantidade;
            const foto = item.produto.fotos?.[0];

            return (
              <div key={index} className="carrinho-item">
                {foto && (
                  <img src={foto} alt={item.produto.nome} className="carrinho-item-foto" />
                )}

                <div className="carrinho-item-info">
                  <div className="carrinho-item-header">
                    <div>
                      <div className="carrinho-item-nome">{item.produto.nome}</div>
                      {item.variacao && (
                        <div className="carrinho-item-variacao">Variação: {item.variacao.nome}</div>
                      )}
                      {item.urlArte && (
                        <div className="carrinho-item-arte">
                          <a href={item.urlArte} target="_blank" rel="noreferrer">✓ Ver arte enviada</a>
                        </div>
                      )}
                    </div>
                    <button
                      className="carrinho-item-remover"
                      onClick={() => removerItem(item.produto._id, item.variacao?.nome)}
                    >
                      Remover
                    </button>
                  </div>

                  <div className="carrinho-item-footer">
                    <div className="carrinho-quantidade">
                      <button onClick={() => atualizarQuantidade(item.produto._id, item.variacao?.nome, item.quantidade - 1)}>−</button>
                      <span>{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.produto._id, item.variacao?.nome, item.quantidade + 1)}>+</button>
                    </div>
                    <div>
                      <span className="carrinho-item-preco">R$ {preco.toFixed(2)} / un</span>
                      <span className="carrinho-item-subtotal">R$ {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RESUMO */}
        <div className="carrinho-resumo">
          <div className="carrinho-resumo-titulo">Resumo do pedido</div>

          {itens.map((item, index) => {
            const preco = item.variacao ? item.variacao.preco : item.produto.preco;
            return (
              <div key={index} className="carrinho-resumo-linha">
                <span>{item.produto.nome} × {item.quantidade}</span>
                <span>R$ {(preco * item.quantidade).toFixed(2)}</span>
              </div>
            );
          })}

          <div className="carrinho-resumo-total">
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>

          <button className="carrinho-btn-finalizar" onClick={() => navigate('/pagamento')}>
            Finalizar pedido →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Carrinho;