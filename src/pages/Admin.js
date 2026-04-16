import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.css';

function Admin() {
  const [aba, setAba] = useState('pedidos');
  const { token } = useAuth();

  return (
    <div className="admin-container">
      <h1 className="admin-titulo">Painel Admin</h1>
      <div className="admin-abas">
        <button
          className={`admin-aba-btn ${aba === 'pedidos' ? 'ativa' : ''}`}
          onClick={() => setAba('pedidos')}
        >
          Pedidos
        </button>
        <button
          className={`admin-aba-btn ${aba === 'produtos' ? 'ativa' : ''}`}
          onClick={() => setAba('produtos')}
        >
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

  if (carregando) return <p style={{ color: '#aaa', padding: '20px' }}>Carregando...</p>;

  return (
    <div className="admin-painel">
      <h2 className="admin-painel-titulo">Pedidos ({pedidos.length})</h2>
      {pedidos.length === 0 ? (
        <p style={{ color: '#666' }}>Nenhum pedido ainda.</p>
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
    <div className="pedido-card">
      <div className="pedido-card-header">
        <span className="pedido-card-id">Pedido #{pedido._id.slice(-6).toUpperCase()}</span>
        <span className={`pedido-card-status status-${pedido.status}`}>{statusLabel[pedido.status]}</span>
      </div>

      <div className="pedido-card-body">
        <div className="pedido-info-grupo">
          <span className="pedido-info-label">Cliente</span>
          <span className="pedido-info-valor">{pedido.usuario?.nome}</span>
          <span className="pedido-info-valor" style={{ color: '#666', fontSize: '13px' }}>{pedido.usuario?.email}</span>
        </div>

        <div className="pedido-info-grupo">
          <span className="pedido-info-label">Pagamento</span>
          <span className="pedido-info-valor">{pedido.pagamento.metodo.toUpperCase()} — {pedido.pagamento.status}</span>
          <span className="pedido-info-valor" style={{ fontWeight: '700', fontSize: '16px' }}>R$ {pedido.total.toFixed(2)}</span>
        </div>

        <div className="pedido-info-grupo">
          <span className="pedido-info-label">Data</span>
          <span className="pedido-info-valor">{new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>

        {pedido.frete?.valor > 0 && (
          <div className="pedido-info-grupo">
            <span className="pedido-info-label">Frete</span>
            <span className="pedido-info-valor">{pedido.frete.prazo} — R$ {pedido.frete.valor.toFixed(2)}</span>
          </div>
        )}

        {pedido.enderecoEntrega?.rua && (
          <div className="pedido-info-grupo" style={{ gridColumn: '1 / -1' }}>
            <span className="pedido-info-label">Endereço de entrega</span>
            <span className="pedido-info-valor">
              {pedido.enderecoEntrega.rua}, {pedido.enderecoEntrega.numero}
              {pedido.enderecoEntrega.complemento && ` - ${pedido.enderecoEntrega.complemento}`} — {pedido.enderecoEntrega.bairro}, {pedido.enderecoEntrega.cidade} - {pedido.enderecoEntrega.estado} / CEP: {pedido.enderecoEntrega.cep}
            </span>
          </div>
        )}

        <div className="pedido-itens">
          <span className="pedido-info-label" style={{ marginBottom: '8px', display: 'block' }}>Itens</span>
          {pedido.itens.map((item, index) => (
            <div key={index} className="pedido-item">
              <span>{item.nome} {item.variacao && `— ${item.variacao}`} × {item.quantidade}</span>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                {item.urlArte && (
                  <a href={item.urlArte} target="_blank" rel="noreferrer" className="pedido-item-arte">
                    Ver arte
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pedido-acoes">
          <div className="pedido-acoes-grupo">
            <span className="pedido-acoes-label">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{statusLabel[s]}</option>
              ))}
            </select>
          </div>
          <div className="pedido-acoes-grupo">
            <span className="pedido-acoes-label">Código de rastreio</span>
            <input
              value={rastreamento}
              onChange={(e) => setRastreamento(e.target.value)}
              placeholder="Ex: BR123456789BR"
            />
          </div>
          <button className="btn-salvar" onClick={() => onAtualizar(pedido._id, status, rastreamento)} disabled={atualizando}>
            {atualizando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
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
    nome: '', categoria: '', descricao: '', preco: '',
    dimensoes: { peso: '', comprimento: '', altura: '', largura: '' },
    variacoes: []
  });
  const [novaVariacao, setNovaVariacao] = useState({
    nome: '', preco: '', peso: '', comprimento: '', altura: '', largura: ''
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
    setForm({ ...form, dimensoes: { ...form.dimensoes, [e.target.name]: e.target.value } });
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  if (carregando) return <p style={{ color: '#aaa', padding: '20px' }}>Carregando...</p>;

  return (
    <div className="admin-painel">
      <h2 className="admin-painel-titulo">Produtos ({produtos.length})</h2>

      <button className="btn-adicionar" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
        {mostrarFormulario ? '✕ Cancelar' : '+ Adicionar produto'}
      </button>

      {mensagem && <p className={mensagem.includes('sucesso') ? 'mensagem-sucesso' : 'mensagem-erro'}>{mensagem}</p>}

      {mostrarFormulario && (
        <div className="produto-form">
          <h3>Novo produto</h3>
          <div className="produto-form-grid">
            <div>
              <label>Nome</label>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label>Categoria</label>
              <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            </div>
          </div>
          <div>
            <label>Descrição</label>
            <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div>
            <label>Preço base (R$)</label>
            <input type="number" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
          </div>
          <div>
            <label>Foto do produto</label>
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setFoto(e.target.files[0])} />
          </div>

          <h4>Dimensões padrão embalado</h4>
          <div className="produto-form-dimensoes">
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
          </div>

          <h4>Variações</h4>
          {form.variacoes.map((v, index) => (
            <div key={index} className="variacao-item">
              <span>{v.nome} — R$ {parseFloat(v.preco).toFixed(2)} | {v.peso}kg {v.comprimento}×{v.altura}×{v.largura}cm</span>
              <button className="btn-desativar" onClick={() => removerVariacao(index)}>Remover</button>
            </div>
          ))}
          <div className="variacao-campos">
            <input placeholder="Nome (ex: 1x1m)" value={novaVariacao.nome} onChange={(e) => setNovaVariacao({ ...novaVariacao, nome: e.target.value })} />
            <input placeholder="Preço" type="number" value={novaVariacao.preco} onChange={(e) => setNovaVariacao({ ...novaVariacao, preco: e.target.value })} />
            <input placeholder="Peso kg" type="number" value={novaVariacao.peso} onChange={(e) => setNovaVariacao({ ...novaVariacao, peso: e.target.value })} />
            <input placeholder="Comp cm" type="number" value={novaVariacao.comprimento} onChange={(e) => setNovaVariacao({ ...novaVariacao, comprimento: e.target.value })} />
            <input placeholder="Alt cm" type="number" value={novaVariacao.altura} onChange={(e) => setNovaVariacao({ ...novaVariacao, altura: e.target.value })} />
            <input placeholder="Larg cm" type="number" value={novaVariacao.largura} onChange={(e) => setNovaVariacao({ ...novaVariacao, largura: e.target.value })} />
            <button className="btn-add-variacao" onClick={adicionarVariacao}>+ Add</button>
          </div>

          <button className="btn-salvar" style={{ marginTop: '20px' }} onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar produto'}
          </button>
        </div>
      )}

      {produtos.length === 0 ? (
        <p style={{ color: '#666' }}>Nenhum produto cadastrado.</p>
      ) : (
        produtos.map((produto) => (
          <div key={produto._id} className="produto-admin-card">
            <div className="produto-admin-info">
              <span className="produto-admin-nome">{produto.nome}</span>
              <span className="produto-admin-detalhes">
                {produto.categoria} — R$ {produto.preco.toFixed(2)} — {produto.variacoes.length} variação(ões)
              </span>
              <span className="produto-admin-detalhes">
                {produto.ativo ? '✅ Ativo' : '❌ Inativo'}
              </span>
            </div>
            <button className="btn-desativar" onClick={() => desativarProduto(produto._id)}>Desativar</button>
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;