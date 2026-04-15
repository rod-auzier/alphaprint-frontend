import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Admin() {
  const [aba, setAba] = useState('pedidos');
  const { token } = useAuth();

  return (
    <div>
      <h1>Painel Admin</h1>
      <div>
        <button onClick={() => setAba('pedidos')} style={{ fontWeight: aba === 'pedidos' ? 'bold' : 'normal' }}>
          Pedidos
        </button>
        <button onClick={() => setAba('produtos')} style={{ fontWeight: aba === 'produtos' ? 'bold' : 'normal' }}>
          Produtos
        </button>
      </div>

      {aba === 'pedidos' && <AbaPedidos token={token} />}
      {aba === 'produtos' && <AbaProdutos token={token} />}
    </div>
  );
}

function AbaPedidos({ token }) {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(null);

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
    'aguardando_pagamento', 'aguardando_arte', 'em_producao',
    'enviado', 'entregue', 'cancelado'
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

      {pedido.enderecoEntrega?.rua && (
        <div>
          <strong>Endereço de entrega:</strong>
          <p>
            {pedido.enderecoEntrega.rua}, {pedido.enderecoEntrega.numero}
            {pedido.enderecoEntrega.complemento && ` - ${pedido.enderecoEntrega.complemento}`} — {pedido.enderecoEntrega.bairro}, {pedido.enderecoEntrega.cidade} - {pedido.enderecoEntrega.estado} / CEP: {pedido.enderecoEntrega.cep}
          </p>
        </div>
      )}

      {pedido.frete?.valor > 0 && (
        <p><strong>Frete:</strong> {pedido.frete.prazo} — R$ {pedido.frete.valor.toFixed(2)}</p>
      )}

      <h4>Itens:</h4>
      {pedido.itens.map((item, index) => (
        <div key={index}>
          <p>{item.nome} {item.variacao && `- ${item.variacao}`} x{item.quantidade}</p>
          {item.urlArte && (
            <a href={item.urlArte} target="_blank" rel="noreferrer">Ver arte do cliente</a>
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
        <input value={rastreamento} onChange={(e) => setRastreamento(e.target.value)} placeholder="Código de rastreio" />
      </div>
      <button onClick={() => onAtualizar(pedido._id, status, rastreamento)} disabled={atualizando}>
        {atualizando ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );
}

function AbaProdutos({ token }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/produtos');
      const dados = await response.json();
      setProdutos(dados);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setCarregando(false);
    }
  };

  const desativarProduto = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/produtos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      carregarProdutos();
    } catch (err) {
      console.error('Erro ao desativar produto:', err);
    }
  };

  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Produtos ({produtos.length})</h2>
      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        produtos.map((produto) => (
          <div key={produto._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
            <p><strong>{produto.nome}</strong></p>
            <p>Categoria: {produto.categoria}</p>
            <p>Preço: R$ {produto.preco.toFixed(2)}</p>
            <p>Variações: {produto.variacoes.map(v => v.nome).join(', ')}</p>
            <p>Status: {produto.ativo ? '✅ Ativo' : '❌ Inativo'}</p>
            <button onClick={() => desativarProduto(produto._id)}>Desativar</button>
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;