import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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

  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Meus Pedidos</h1>

      {pedidos.length === 0 ? (
        <p>Você ainda não fez nenhum pedido.</p>
      ) : (
        pedidos.map((pedido) => (
          <div key={pedido._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
            <p><strong>Pedido:</strong> #{pedido._id.slice(-6).toUpperCase()}</p>
            <p><strong>Status:</strong> {statusLabel[pedido.status]}</p>
            <p><strong>Total:</strong> R$ {pedido.total.toFixed(2)}</p>
            <p><strong>Pagamento:</strong> {pedido.pagamento.metodo.toUpperCase()}</p>
            <p><strong>Data:</strong> {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</p>

            <h4>Itens:</h4>
            {pedido.itens.map((item, index) => (
              <p key={index}>
                {item.nome} {item.variacao && `- ${item.variacao}`} x{item.quantidade} — R$ {(item.preco * item.quantidade).toFixed(2)}
              </p>
            ))}

            {pedido.rastreamento && (
              <p><strong>Rastreamento:</strong> {pedido.rastreamento}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default MeusPedidos;