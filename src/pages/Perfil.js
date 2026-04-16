import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Perfil() {
  const { usuario, token, entrar } = useAuth();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
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
    setForm({
      ...form,
      endereco: { ...form.endereco, [e.target.name]: e.target.value }
    });
  };

  const handleSalvar = async () => {
    setSalvando(true);
    setMensagem('');
    try {
      const response = await fetch('http://localhost:5000/api/usuarios/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const dados = await response.json();
      if (dados._id) {
        entrar(dados, token);
        setMensagem('Perfil atualizado com sucesso!');
        setEditando(false);
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
    <div>
      <h1>Meu Perfil</h1>

      {!editando ? (
        <div>
          <p><strong>Nome:</strong> {usuario?.nome}</p>
          <p><strong>Email:</strong> {usuario?.email}</p>
          <p><strong>CPF:</strong> {usuario?.cpf}</p>

          <h3>Endereço</h3>
          {usuario?.endereco?.rua ? (
            <p>
              {usuario.endereco.rua}, {usuario.endereco.numero}
              {usuario.endereco.complemento && ` - ${usuario.endereco.complemento}`} — {usuario.endereco.bairro}, {usuario.endereco.cidade} - {usuario.endereco.estado} / CEP: {usuario.endereco.cep}
            </p>
          ) : (
            <p>Nenhum endereço cadastrado.</p>
          )}

          <button onClick={() => setEditando(true)}>Editar perfil</button>
        </div>
      ) : (
        <div>
          <div>
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange} />
          </div>

          <h3>Endereço</h3>
          <div>
            <label>CEP</label>
            <input name="cep" value={form.endereco.cep} onChange={handleEndereco} />
          </div>
          <div>
            <label>Rua</label>
            <input name="rua" value={form.endereco.rua} onChange={handleEndereco} />
          </div>
          <div>
            <label>Número</label>
            <input name="numero" value={form.endereco.numero} onChange={handleEndereco} />
          </div>
          <div>
            <label>Complemento</label>
            <input name="complemento" value={form.endereco.complemento} onChange={handleEndereco} />
          </div>
          <div>
            <label>Bairro</label>
            <input name="bairro" value={form.endereco.bairro} onChange={handleEndereco} />
          </div>
          <div>
            <label>Cidade</label>
            <input name="cidade" value={form.endereco.cidade} onChange={handleEndereco} />
          </div>
          <div>
            <label>Estado</label>
            <input name="estado" value={form.endereco.estado} onChange={handleEndereco} />
          </div>

          {mensagem && <p style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>}

          <button onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button onClick={() => setEditando(false)}>Cancelar</button>
        </div>
      )}

      {mensagem && !editando && <p style={{ color: 'green' }}>{mensagem}</p>}
    </div>
  );
}

export default Perfil;