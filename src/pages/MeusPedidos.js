import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/MeusPedidos.css';

function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pedidos/meus', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dados = await response.json();
        setPedidos(dados);
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [token]);

  const statusLabel = {
    aguardando_pagamento: 'Aguardando pagamento',
    aguardando_arte: 'Aguardando arte',
    em_producao: 'Em produção',
    enviado: 'Enviado',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
  };

  const statusCor = {
    aguardando_pagamento: '#e8a020',
    aguardando_arte: '#3b82f6',
    em_producao: '#8b5cf6',
    enviado: '#0ea5e9',
    entregue: '#22c55e',
    cancelado: '#ef4444'
  };

  const etapas = [
    { key: 'aguardando_pagamento', label: 'Pedido Realizado' },
    { key: 'em_producao',          label: 'Em Produção' },
    { key: 'enviado',              label: 'Enviado' },
    { key: 'entregue',             label: 'Entregue' },
  ];

  const etapaAtual = (status) => {
    const index = etapas.findIndex(e => e.key === status);
    return index === -1 ? 0 : index;
  };

  if (carregando) return <p style={{ padding: '40px', color: '#888' }}>Carregando pedidos...</p>;

  return (
    <div className="meus-pedidos-container">
      <h1 className="meus-pedidos-titulo">Meus Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="meus-pedidos-vazio">
          <p>Você ainda não fez nenhum pedido.</p>
        </div>
      ) : (
        pedidos.map((pedido) => {
          const etapa = etapaAtual(pedido.status);
          const cancelado = pedido.status === 'cancelado';

          return (
            <div key={pedido._id} className="pedido-card-cliente">
              {/* HEADER DO CARD */}
              <div className="pedido-card-cliente-header">
                <div className="pedido-card-cliente-info">
                  <div className="pedido-card-cliente-grupo">
                    <span className="pedido-card-cliente-label">Número do Pedido</span>
                    <span className="pedido-card-cliente-valor">#{pedido._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="pedido-card-cliente-grupo">
                    <span className="pedido-card-cliente-label">Pagamento</span>
                    <span className="pedido-card-cliente-valor">{pedido.pagamento.metodo.toUpperCase()}</span>
                  </div>
                  <div className="pedido-card-cliente-grupo">
                    <span className="pedido-card-cliente-label">Data</span>
                    <span className="pedido-card-cliente-valor">{new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="pedido-card-cliente-grupo">
                    <span className="pedido-card-cliente-label">Valor Total</span>
                    <span className="pedido-card-cliente-valor">R$ {pedido.total.toFixed(2)}</span>
                  </div>
                </div>
                <div
                  className="pedido-card-cliente-status"
                  style={{ color: statusCor[pedido.status] || '#666' }}
                >
                  {statusLabel[pedido.status]}
                </div>
              </div>

              {/* ITENS */}
              <div className="pedido-card-cliente-itens">
                {pedido.itens.map((item, index) => (
                  <div key={index} className="pedido-card-cliente-item">
                    <span>{item.nome}{item.variacao && ` — ${item.variacao}`} × {item.quantidade}</span>
                    <span className="pedido-card-cliente-item-preco">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    {item.urlArte && (
                      <a href={item.urlArte} target="_blank" rel="noreferrer" className="pedido-card-cliente-arte">
                        Ver arte
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* RASTREAMENTO */}
              {pedido.rastreamento && (
                <div className="pedido-card-cliente-rastreamento">
                  <span className="pedido-card-cliente-label">Código de rastreio:</span>
                  <strong>{pedido.rastreamento}</strong>
                </div>
              )}

              {/* LINHA DO TEMPO */}
              {!cancelado && (
                <div className="pedido-timeline">
                  {etapas.map((e, i) => {
                    const concluida = i <= etapa;
                    const atual = i === etapa;
                    return (
                      <React.Fragment key={e.key}>
                        <div className="pedido-timeline-etapa">
                          <div className={`pedido-timeline-circulo ${concluida ? 'concluida' : ''} ${atual ? 'atual' : ''}`}>
                            {concluida ? '✓' : i + 1}
                          </div>
                          <span className={`pedido-timeline-label ${concluida ? 'concluida' : ''}`}>
                            {e.label}
                          </span>
                        </div>
                        {i < etapas.length - 1 && (
                          <div className={`pedido-timeline-linha ${i < etapa ? 'concluida' : ''}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {cancelado && (
                <div className="pedido-cancelado-aviso">
                  Pedido cancelado
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default MeusPedidos;