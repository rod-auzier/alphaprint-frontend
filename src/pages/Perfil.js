import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Perfil.css';

function Perfil() {
  const { usuario, token, entrar } = useAuth();
  const [editandoDados, setEditandoDados] = useState(false);
  const [editandoEndereco, setEditandoEndereco] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    cpf: usuario?.cpf || '',
    endereco: {
      cep: usuario?.endereco?.cep || '',
      rua: usuario?.endereco?.rua || '',
      numero: usuario?.endereco?.numero || '',
      complemento: usuario?.endereco?.complemento || '',
      bairro: usuario?.endereco?.bairro || '',
      cidade: usuario?.endereco?.cidade || '',
      estado: usuario?.endereco?.estado || ''
    }
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEndereco = (e) => {
    setForm({ ...form, endereco: { ...form.endereco, [e.target.name]: e.target.value } });
  };

  const handleSalvar = async () => {
    setSalvando(true);
    setMensagem('');
    try {
      const response = await fetch('http://localhost:5000/api/usuarios/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const dados = await response.json();
      if (dados._id) {
        entrar(dados, token);
        setMensagem('Perfil atualizado com sucesso!');
        setEditandoDados(false);
        setEditandoEndereco(false);
      } else {
        setMensagem(dados.mensagem || 'Erro ao atualizar perfil');
      }
    } catch (err) {
      setMensagem('Erro ao conectar com o servidor');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="perfil-container">
      <h1 className="perfil-titulo">Meu Perfil</h1>

      {mensagem && (
        <p className={mensagem.includes('sucesso') ? 'perfil-mensagem-sucesso' : 'perfil-mensagem-erro'}>
          {mensagem}
        </p>
      )}

      {/* SEÇÃO: MEUS DADOS */}
      <div className="perfil-card">
        <div className="perfil-card-header">
          <h2 className="perfil-card-titulo">Meus Dados</h2>
          {!editandoDados && (
            <button className="perfil-btn-editar" onClick={() => setEditandoDados(true)}>
              Editar
            </button>
          )}
        </div>

        {!editandoDados ? (
          <div className="perfil-info-grid">
            <div className="perfil-info-grupo">
              <span className="perfil-info-label">Nome completo</span>
              <span className="perfil-info-valor">{usuario?.nome}</span>
            </div>
            <div className="perfil-info-grupo">
              <span className="perfil-info-label">E-mail</span>
              <span className="perfil-info-valor">{usuario?.email}</span>
            </div>
            <div className="perfil-info-grupo">
              <span className="perfil-info-label">CPF</span>
              <span className="perfil-info-valor">{usuario?.cpf || '—'}</span>
            </div>
          </div>
        ) : (
          <div className="perfil-form">
            <div className="perfil-form-grid">
              <div className="perfil-form-grupo">
                <label>Nome completo</label>
                <input name="nome" value={form.nome} onChange={handleChange} />
              </div>
              <div className="perfil-form-grupo">
                <label>CPF</label>
                <input name="cpf" value={form.cpf} onChange={handleChange} />
              </div>
            </div>
            <div className="perfil-form-acoes">
              <button className="perfil-btn-salvar" onClick={handleSalvar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button className="perfil-btn-cancelar" onClick={() => setEditandoDados(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SEÇÃO: ENDEREÇO */}
      <div className="perfil-card">
        <div className="perfil-card-header">
          <h2 className="perfil-card-titulo">Endereço de Entrega</h2>
          {!editandoEndereco && (
            <button className="perfil-btn-editar" onClick={() => setEditandoEndereco(true)}>
              {usuario?.endereco?.rua ? 'Editar' : 'Adicionar'}
            </button>
          )}
        </div>

        {!editandoEndereco ? (
          usuario?.endereco?.rua ? (
            <div className="perfil-info-grid">
              <div className="perfil-info-grupo">
                <span className="perfil-info-label">Rua</span>
                <span className="perfil-info-valor">{usuario.endereco.rua}, {usuario.endereco.numero}{usuario.endereco.complemento && ` - ${usuario.endereco.complemento}`}</span>
              </div>
              <div className="perfil-info-grupo">
                <span className="perfil-info-label">Bairro</span>
                <span className="perfil-info-valor">{usuario.endereco.bairro}</span>
              </div>
              <div className="perfil-info-grupo">
                <span className="perfil-info-label">Cidade / Estado</span>
                <span className="perfil-info-valor">{usuario.endereco.cidade} - {usuario.endereco.estado}</span>
              </div>
              <div className="perfil-info-grupo">
                <span className="perfil-info-label">CEP</span>
                <span className="perfil-info-valor">{usuario.endereco.cep}</span>
              </div>
            </div>
          ) : (
            <p className="perfil-vazio">Nenhum endereço cadastrado.</p>
          )
        ) : (
          <div className="perfil-form">
            <div className="perfil-form-grid">
              <div className="perfil-form-grupo">
                <label>CEP</label>
                <input name="cep" value={form.endereco.cep} onChange={handleEndereco} />
              </div>
              <div className="perfil-form-grupo">
                <label>Estado</label>
                <input name="estado" value={form.endereco.estado} onChange={handleEndereco} />
              </div>
            </div>
            <div className="perfil-form-grid">
              <div className="perfil-form-grupo" style={{ gridColumn: '1 / -1' }}>
                <label>Rua</label>
                <input name="rua" value={form.endereco.rua} onChange={handleEndereco} />
              </div>
            </div>
            <div className="perfil-form-grid">
              <div className="perfil-form-grupo">
                <label>Número</label>
                <input name="numero" value={form.endereco.numero} onChange={handleEndereco} />
              </div>
              <div className="perfil-form-grupo">
                <label>Complemento</label>
                <input name="complemento" value={form.endereco.complemento} onChange={handleEndereco} />
              </div>
            </div>
            <div className="perfil-form-grid">
              <div className="perfil-form-grupo">
                <label>Bairro</label>
                <input name="bairro" value={form.endereco.bairro} onChange={handleEndereco} />
              </div>
              <div className="perfil-form-grupo">
                <label>Cidade</label>
                <input name="cidade" value={form.endereco.cidade} onChange={handleEndereco} />
              </div>
            </div>
            <div className="perfil-form-acoes">
              <button className="perfil-btn-salvar" onClick={handleSalvar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button className="perfil-btn-cancelar" onClick={() => setEditandoEndereco(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Perfil;