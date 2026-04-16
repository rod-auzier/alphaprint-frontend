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
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [foto, setFoto] = useState(null);
  const [form, setForm] = useState({
    nome: '',
    categoria: '',
    descricao: '',
    preco: '',
    dimensoes: {
      peso: '',
      comprimento: '',
      altura: '',
      largura: ''
    },
    variacoes: []
  });
  const [novaVariacao, setNovaVariacao] = useState({
    nome: '',
    preco: '',
    peso: '',
    comprimento: '',
    altura: '',
    largura: ''
  });

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

  const handleDimensoes = (e) => {
    setForm({
      ...form,
      dimensoes: { ...form.dimensoes, [e.target.name]: e.target.value }
    });
  };

  const adicionarVariacao = () => {
    if (!novaVariacao.nome || !novaVariacao.preco) return;
    setForm({ ...form, variacoes: [...form.variacoes, { ...novaVariacao }] });
    setNovaVariacao({ nome: '', preco: '', peso: '', comprimento: '', altura: '', largura: '' });
  };

  const removerVariacao = (index) => {
    setForm({ ...form, variacoes: form.variacoes.filter((_, i) => i !== index) });
  };

  const handleSalvar = async () => {
    setSalvando(true);
    setMensagem('');
    try {
      let urlFoto = '';

      if (foto) {
        const formData = new FormData();
        formData.append('foto', foto);
        const uploadResponse = await fetch('http://localhost:5000/api/upload/produto', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const uploadDados = await uploadResponse.json();
        urlFoto = uploadDados.url || '';
      }

      const response = await fetch('http://localhost:5000/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          preco: parseFloat(form.preco),
          dimensoes: {
            peso: parseFloat(form.dimensoes.peso) || 0,
            comprimento: parseFloat(form.dimensoes.comprimento) || 0,
            altura: parseFloat(form.dimensoes.altura) || 0,
            largura: parseFloat(form.dimensoes.largura) || 0
          },
          variacoes: form.variacoes.map(v => ({
            ...v,
            preco: parseFloat(v.preco),
            peso: parseFloat(v.peso) || 0,
            comprimento: parseFloat(v.comprimento) || 0,
            altura: parseFloat(v.altura) || 0,
            largura: parseFloat(v.largura) || 0
          })),
          fotos: urlFoto ? [urlFoto] : []
        })
      });

      const dados = await response.json();
      if (dados._id) {
        setMensagem('Produto cadastrado com sucesso!');
        setForm({ nome: '', categoria: '', descricao: '', preco: '', dimensoes: { peso: '', comprimento: '', altura: '', largura: '' }, variacoes: [] });
        setFoto(null);
        setMostrarFormulario(false);
        carregarProdutos();
      } else {
        setMensagem(dados.mensagem || 'Erro ao cadastrar produto');
      }
    } catch (err) {
      setMensagem('Erro ao conectar com o servidor');
    } finally {
      setSalvando(false);
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

      <button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
        {mostrarFormulario ? 'Cancelar' : '+ Adicionar produto'}
      </button>

      {mensagem && <p style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>}

      {mostrarFormulario && (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>Novo produto</h3>
          <div>
            <label>Nome</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <label>Categoria</label>
            <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
          </div>
          <div>
            <label>Descrição</label>
            <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div>
            <label>Preço base</label>
            <input type="number" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
          </div>
          <div>
            <label>Foto do produto</label>
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setFoto(e.target.files[0])} />
          </div>

          <h4>Dimensões padrão do produto embalado</h4>
          <div>
            <label>Peso (kg)</label>
            <input type="number" name="peso" value={form.dimensoes.peso} onChange={handleDimensoes} />
          </div>
          <div>
            <label>Comprimento (cm)</label>
            <input type="number" name="comprimento" value={form.dimensoes.comprimento} onChange={handleDimensoes} />
          </div>
          <div>
            <label>Altura (cm)</label>
            <input type="number" name="altura" value={form.dimensoes.altura} onChange={handleDimensoes} />
          </div>
          <div>
            <label>Largura (cm)</label>
            <input type="number" name="largura" value={form.dimensoes.largura} onChange={handleDimensoes} />
          </div>

          <h4>Variações</h4>
          {form.variacoes.map((v, index) => (
            <div key={index}>
              <span>{v.nome} — R$ {parseFloat(v.preco).toFixed(2)} | {v.peso}kg {v.comprimento}x{v.altura}x{v.largura}cm</span>
              <button onClick={() => removerVariacao(index)}>Remover</button>
            </div>
          ))}
          <div>
            <input placeholder="Nome da variação (ex: 1x1m)" value={novaVariacao.nome} onChange={(e) => setNovaVariacao({ ...novaVariacao, nome: e.target.value })} />
            <input placeholder="Preço" type="number" value={novaVariacao.preco} onChange={(e) => setNovaVariacao({ ...novaVariacao, preco: e.target.value })} />
            <input placeholder="Peso (kg)" type="number" value={novaVariacao.peso} onChange={(e) => setNovaVariacao({ ...novaVariacao, peso: e.target.value })} />
            <input placeholder="Comprimento (cm)" type="number" value={novaVariacao.comprimento} onChange={(e) => setNovaVariacao({ ...novaVariacao, comprimento: e.target.value })} />
            <input placeholder="Altura (cm)" type="number" value={novaVariacao.altura} onChange={(e) => setNovaVariacao({ ...novaVariacao, altura: e.target.value })} />
            <input placeholder="Largura (cm)" type="number" value={novaVariacao.largura} onChange={(e) => setNovaVariacao({ ...novaVariacao, largura: e.target.value })} />
            <button onClick={adicionarVariacao}>Adicionar variação</button>
          </div>

          <button onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar produto'}
          </button>
        </div>
      )}

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