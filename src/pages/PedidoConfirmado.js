import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../styles/PedidoConfirmado.css';

function PedidoConfirmado() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const pedido = state?.pedido;

  const metodoPagamentoLabel = {
    pix: 'PIX',
    cartao: 'Cartão de Crédito',
    boleto: 'Boleto Bancário'
  };

  if (!pedido) {
    return (
      <div className="confirmado-container">
        <div className="confirmado-card">
          <p style={{ color: '#888' }}>Nenhum pedido encontrado.</p>
          <Link to="/" className="confirmado-btn-secundario">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmado-container">
      <div className="confirmado-card">
        {/* ÍCONE */}
        <div className="confirmado-icone">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#22c55e"/>
            <path d="M6 12l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="confirmado-titulo">Pedido realizado com sucesso!</h1>
        <p className="confirmado-subtitulo">Obrigado pela sua compra. Em breve entraremos em contato.</p>

        {/* NÚMERO DO PEDIDO */}
        <div className="confirmado-numero">
          <span className="confirmado-numero-label">Número do pedido</span>
          <span className="confirmado-numero-valor">#{pedido._id.slice(-6).toUpperCase()}</span>
        </div>

        {/* RESUMO */}
        <div className="confirmado-resumo">
          <div className="confirmado-resumo-linha">
            <span>Pagamento</span>
            <span>{metodoPagamentoLabel[pedido.pagamento?.metodo] || pedido.pagamento?.metodo?.toUpperCase()}</span>
          </div>
          {pedido.frete?.valor > 0 && (
            <div className="confirmado-resumo-linha">
              <span>Frete</span>
              <span>R$ {pedido.frete.valor.toFixed(2)} — {pedido.frete.prazo}</span>
            </div>
          )}
          <div className="confirmado-resumo-total">
            <span>Total</span>
            <span>R$ {pedido.total.toFixed(2)}</span>
          </div>
        </div>

        {/* ITENS */}
        <div className="confirmado-itens">
          <p className="confirmado-itens-titulo">Itens do pedido</p>
          {pedido.itens.map((item, index) => (
            <div key={index} className="confirmado-item">
              <span>{item.nome}{item.variacao && ` — ${item.variacao}`} × {item.quantidade}</span>
              <span className="confirmado-item-preco">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* BOTÕES */}
        <div className="confirmado-acoes">
          <Link to="/meus-pedidos" className="confirmado-btn-primario">
            Ver meus pedidos
          </Link>
          <button className="confirmado-btn-secundario" onClick={() => navigate('/')}>
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  );
}

export default PedidoConfirmado;