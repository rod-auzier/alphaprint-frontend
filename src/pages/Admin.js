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
        <button className={`admin-aba-btn ${aba === 'pedidos' ? 'ativa' : ''}`} onClick={() => setAba('pedidos')}>Pedidos</button>
        <button className={`admin-aba-btn ${aba === 'produtos' ? 'ativa' : ''}`} onClick={() => setAba('produtos')}>Produtos</button>
        <button className={`admin-aba-btn ${aba === 'categorias' ? 'ativa' : ''}`} onClick={() => setAba('categorias')}>Categorias</button>
      </div>

      {aba === 'pedidos' && <AbaPedidos token={token} />}
      {aba === 'produtos' && <AbaProdutos token={token} />}
      {aba === 'categorias' && <AbaCategorias token={token} />}
    </div>
  );
}

function AbaPedidos({ token }) {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(null);

  useEffect(() => { carregarPedidos(); }, []);

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, rastreamento })
      });
      carregarPedidos();
    } catch (err) {
      console.error('Erro ao atualizar pedido:', err);
    } finally {
      setAtualizando(null);
    }
  };

  const statusOptions = ['aguardando_pagamento', 'aguardando_arte', 'em_producao', 'enviado', 'entregue', 'cancelado'];
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
          <PedidoAdmin key={pedido._id} pedido={pedido} statusOptions={statusOptions} statusLabel={statusLabel} atualizando={atualizando === pedido._id} onAtualizar={atualizarPedido} />
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
                {item.urlArte && <a href={item.urlArte} target="_blank" rel="noreferrer" className="pedido-item-arte">Ver arte</a>}
              </div>
            </div>
          ))}
        </div>
        <div className="pedido-acoes">
          <div className="pedido-acoes-grupo">
            <span className="pedido-acoes-label">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
          </div>
          <div className="pedido-acoes-grupo">
            <span className="pedido-acoes-label">Código de rastreio</span>
            <input value={rastreamento} onChange={(e) => setRastreamento(e.target.value)} placeholder="Ex: BR123456789BR" />
          </div>
          <button className="btn-salvar" onClick={() => onAtualizar(pedido._id, status, rastreamento)} disabled={atualizando}>
            {atualizando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AbaCategorias({ token }) {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNome, setEditandoNome] = useState('');

  useEffect(() => { carregarCategorias(); }, []);

  const carregarCategorias = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categorias');
      const dados = await res.json();
      setCategorias(dados);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const handleAdicionar = async () => {
    if (!novaCategoria.trim()) return;
    setSalvando(true);
    try {
      const res = await fetch('http://localhost:5000/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nome: novaCategoria.trim() })
      });
      const dados = await res.json();
      if (dados._id) {
        setNovaCategoria('');
        setMensagem('Categoria adicionada!');
        carregarCategorias();
      } else {
        setMensagem(dados.mensagem || 'Erro ao adicionar');
      }
    } catch (err) {
      setMensagem('Erro ao conectar');
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagem(''), 3000);
    }
  };

  const handleEditar = async (id) => {
    if (!editandoNome.trim()) return;
    try {
      const res = await fetch(`http://localhost:5000/api/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nome: editandoNome.trim() })
      });
      const dados = await res.json();
      if (dados._id) {
        setEditandoId(null);
        setEditandoNome('');
        setMensagem('Categoria atualizada!');
        carregarCategorias();
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem(dados.mensagem || 'Erro ao atualizar');
      }
    } catch (err) {
      setMensagem('Erro ao conectar');
    }
  };

  const handleRemover = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/categorias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      carregarCategorias();
    } catch (err) {
      console.error('Erro ao remover categoria:', err);
    }
  };

  return (
    <div className="admin-painel">
      <h2 className="admin-painel-titulo">Categorias ({categorias.length})</h2>

      <div className="admin-categoria-form">
        <input
          className="admin-busca"
          placeholder="Nome da nova categoria..."
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdicionar()}
        />
        <button className="btn-adicionar" style={{ margin: 0 }} onClick={handleAdicionar} disabled={salvando}>
          {salvando ? 'Salvando...' : '+ Adicionar'}
        </button>
      </div>

      {mensagem && (
        <p className={mensagem.includes('adicionada') || mensagem.includes('atualizada') ? 'mensagem-sucesso' : 'mensagem-erro'}>{mensagem}</p>
      )}

      {categorias.length === 0 ? (
        <p style={{ color: '#666' }}>Nenhuma categoria cadastrada.</p>
      ) : (
        categorias.map((cat) => (
          <div key={cat._id} className="produto-admin-card">
            {editandoId === cat._id ? (
              <input
                className="admin-busca"
                style={{ flex: 1 }}
                value={editandoNome}
                onChange={(e) => setEditandoNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditar(cat._id)}
                autoFocus
              />
            ) : (
              <span className="produto-admin-nome">{cat.nome}</span>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              {editandoId === cat._id ? (
                <>
                  <button className="btn-editar" onClick={() => handleEditar(cat._id)}>Salvar</button>
                  <button className="btn-desativar" onClick={() => setEditandoId(null)}>Cancelar</button>
                </>
              ) : (
                <>
                  <button className="btn-editar" onClick={() => { setEditandoId(cat._id); setEditandoNome(cat.nome); }}>Editar</button>
                  <button className="btn-desativar" onClick={() => handleRemover(cat._id)}>Remover</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AbaProdutos({ token }) {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [foto, setFoto] = useState(null);
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [form, setForm] = useState({
    nome: '', categoria: '', descricao: '', preco: '',
    dimensoes: { peso: '', comprimento: '', altura: '', largura: '' },
    variacoes: []
  });
  const [novaVariacao, setNovaVariacao] = useState({ nome: '', preco: '', peso: '', comprimento: '', altura: '', largura: '' });

  useEffect(() => {
    carregarProdutos();
    carregarCategorias();
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

  const carregarCategorias = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categorias');
      const dados = await res.json();
      setCategorias(dados);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const produtosFiltrados = produtos.filter((p) => {
    const termoOk = busca === '' || p.nome.toLowerCase().includes(busca.toLowerCase());
    const categoriaOk = categoriaSelecionada === '' || p.categoria === categoriaSelecionada;
    return termoOk && categoriaOk;
  });

  const handleDimensoes = (e) => setForm({ ...form, dimensoes: { ...form.dimensoes, [e.target.name]: e.target.value } });

  const adicionarVariacao = () => {
    if (!novaVariacao.nome || !novaVariacao.preco) return;
    setForm({ ...form, variacoes: [...form.variacoes, { ...novaVariacao }] });
    setNovaVariacao({ nome: '', preco: '', peso: '', comprimento: '', altura: '', largura: '' });
  };

  const removerVariacao = (index) => setForm({ ...form, variacoes: form.variacoes.filter((_, i) => i !== index) });

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

  const handleEditar = (produto) => {
    setForm({
      nome: produto.nome,
      categoria: produto.categoria || '',
      descricao: produto.descricao || '',
      preco: produto.preco,
      dimensoes: produto.dimensoes || { peso: '', comprimento: '', altura: '', largura: '' },
      variacoes: produto.variacoes || []
    });
    setEditando(produto._id);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAtualizar = async () => {
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

      const response = await fetch(`http://localhost:5000/api/produtos/${editando}`, {
        method: 'PUT',
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
          ...(urlFoto ? { fotos: [urlFoto] } : {})
        })
      });

      const dados = await response.json();
      if (dados._id) {
        setMensagem('Produto atualizado com sucesso!');
        setForm({ nome: '', categoria: '', descricao: '', preco: '', dimensoes: { peso: '', comprimento: '', altura: '', largura: '' }, variacoes: [] });
        setFoto(null);
        setMostrarFormulario(false);
        setEditando(null);
        carregarProdutos();
      } else {
        setMensagem(dados.mensagem || 'Erro ao atualizar produto');
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

      <div className="admin-produtos-toolbar">
        <button className="btn-adicionar" style={{ margin: 0 }} onClick={() => { setMostrarFormulario(!mostrarFormulario); setEditando(null); setForm({ nome: '', categoria: '', descricao: '', preco: '', dimensoes: { peso: '', comprimento: '', altura: '', largura: '' }, variacoes: [] }); }}>
          {mostrarFormulario ? '✕ Cancelar' : '+ Adicionar produto'}
        </button>
        <input className="admin-busca" type="text" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className="admin-busca-categoria" value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => <option key={cat._id} value={cat.nome}>{cat.nome}</option>)}
        </select>
      </div>

      {mensagem && <p className={mensagem.includes('sucesso') ? 'mensagem-sucesso' : 'mensagem-erro'}>{mensagem}</p>}

      {mostrarFormulario && (
        <div className="produto-form">
          <h3>{editando ? 'Editar produto' : 'Novo produto'}</h3>
          <div className="produto-form-grid">
            <div>
              <label>Nome</label>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label>Categoria</label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Selecione uma categoria</option>
                {categorias.map((cat) => <option key={cat._id} value={cat.nome}>{cat.nome}</option>)}
              </select>
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
            <div><label>Peso (kg)</label><input type="number" name="peso" value={form.dimensoes.peso} onChange={handleDimensoes} /></div>
            <div><label>Comprimento (cm)</label><input type="number" name="comprimento" value={form.dimensoes.comprimento} onChange={handleDimensoes} /></div>
            <div><label>Altura (cm)</label><input type="number" name="altura" value={form.dimensoes.altura} onChange={handleDimensoes} /></div>
            <div><label>Largura (cm)</label><input type="number" name="largura" value={form.dimensoes.largura} onChange={handleDimensoes} /></div>
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
          <button className="btn-salvar" style={{ marginTop: '20px' }} onClick={editando ? handleAtualizar : handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : editando ? 'Atualizar produto' : 'Salvar produto'}
          </button>
        </div>
      )}

      {produtosFiltrados.length === 0 ? (
        <p style={{ color: '#666' }}>{busca || categoriaSelecionada ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}</p>
      ) : (
        produtosFiltrados.map((produto) => (
          <div key={produto._id} className="produto-admin-card">
            <div className="produto-admin-info">
              <span className="produto-admin-nome">{produto.nome}</span>
              <span className="produto-admin-detalhes">{produto.categoria} — R$ {produto.preco.toFixed(2)} — {produto.variacoes.length} variação(ões)</span>
              <span className="produto-admin-detalhes">{produto.ativo ? '✅ Ativo' : '❌ Inativo'}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-editar" onClick={() => handleEditar(produto)}>Editar</button>
              <button className="btn-desativar" onClick={() => desativarProduto(produto._id)}>Desativar</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;