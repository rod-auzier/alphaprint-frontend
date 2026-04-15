import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Admin() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pedidos', {
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

  const atualizarPedido = async (id, status, rastreamento) => {
    setAtualizando(id);
    try {
      await fetch(`http://localhost:5000/api/pedidos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, rastreamento })
      });
      carregarPedidos();
    } catch (err) {
      console.error('Erro ao atualizar pedido:', err);
    } finally {
      setAtualizando(null);
    }
  };

  const statusOptions = [
    'aguardando_pagamento',
    'aguardando_arte',
    'em_producao',
    'enviado',
    'entregue',
    'cancelado'
  ];

  const statusLabel = {
    aguardando_pagamento: 'Aguardando pagamento',
    aguardando_arte: 'Aguardando arte',
    em_producao: 'Em produção',
    enviado: 'Enviado',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
  };

  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Painel Admin</h1>
      <h2>Pedidos ({pedidos.length})</h2>

      {pedidos.length === 0 ? (
        <p>Nenhum pedido ainda.</p>
      ) : (
        pedidos.map((pedido) => (
          <PedidoAdmin
            key={pedido._id}
            pedido={pedido}
            statusOptions={statusOptions}
            statusLabel={statusLabel}
            atualizando={atualizando === pedido._id}
            onAtualizar={atualizarPedido}
          />
        ))
      )}
    </div>
  );
}

function PedidoAdmin({ pedido, statusOptions, statusLabel, atualizando, onAtualizar }) {
  const [status, setStatus] = useState(pedido.status);
  const [rastreamento, setRastreamento] = useState(pedido.rastreamento || '');

  return (
    <div style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
      <p><strong>Pedido:</strong> #{pedido._id.slice(-6).toUpperCase()}</p>
      <p><strong>Cliente:</strong> {pedido.usuario?.nome} — {pedido.usuario?.email}</p>
      <p><strong>Total:</strong> R$ {pedido.total.toFixed(2)}</p>
      <p><strong>Pagamento:</strong> {pedido.pagamento.metodo.toUpperCase()} — {pedido.pagamento.status}</p>
      <p><strong>Data:</strong> {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</p>

      <h4>Itens:</h4>
      {pedido.itens.map((item, index) => (
        <div key={index}>
          <p>{item.nome} {item.variacao && `- ${item.variacao}`} x{item.quantidade}</p>
          {item.urlArte && (
            <a href={item.urlArte} target="_blank" rel="noreferrer">
              Ver arte do cliente
            </a>
          )}
        </div>
      ))}

      <div>
        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusLabel[s]}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Rastreamento:</label>
        <input
          value={rastreamento}
          onChange={(e) => setRastreamento(e.target.value)}
          placeholder="Código de rastreio"
        />
      </div>

      <button
        onClick={() => onAtualizar(pedido._id, status, rastreamento)}
        disabled={atualizando}
      >
        {atualizando ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );
}

export default Admin;