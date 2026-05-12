import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cadastrar } from '../services/api';

function Cadastro() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    }
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEndereco = (e) => {
    setForm({
      ...form,
      endereco: { ...form.endereco, [e.target.name]: e.target.value }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      const resultado = await cadastrar(form);

      if (resultado.mensagem === 'Usuário cadastrado com sucesso!') {
        setSucesso('Cadastro realizado! Redirecionando...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setErro(resultado.mensagem);
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div>
      <h2>Cadastro</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Senha</label>
          <input name="senha" type="password" value={form.senha} onChange={handleChange} required />
        </div>
        <div>
          <label>CPF</label>
          <input name="cpf" value={form.cpf} onChange={handleChange} required />
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

        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        {sucesso && <p style={{ color: 'green' }}>{sucesso}</p>}

        <button type="submit" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      <p>Já tem cadastro? <Link to="/login">Entrar</Link></p>
    </div>
  );
}

export default Cadastro;