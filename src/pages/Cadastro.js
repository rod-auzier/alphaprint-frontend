import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cadastrar } from '../services/api';
import '../styles/Auth.css';

function Cadastro() {
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', cpf: '',
    endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEndereco = (e) => setForm({ ...form, endereco: { ...form.endereco, [e.target.name]: e.target.value } });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(''); setSucesso(''); setCarregando(true);
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
    <div className="auth-container">
      <div className="auth-card auth-card-grande">
        <div className="auth-logo">Alpha<span>Print</span></div>
        <h2 className="auth-titulo">Criar conta</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* DADOS PESSOAIS */}
          <div className="auth-secao-titulo">Dados pessoais</div>
          <div className="auth-grid-2">
            <div className="auth-grupo">
              <label>Nome completo</label>
              <input name="nome" placeholder="Seu nome" value={form.nome} onChange={handleChange} required />
            </div>
            <div className="auth-grupo">
              <label>CPF</label>
              <input name="cpf" placeholder="000.000.000-00" value={form.cpf} onChange={handleChange} required />
            </div>
          </div>
          <div className="auth-grid-2">
            <div className="auth-grupo">
              <label>E-mail</label>
              <input name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="auth-grupo">
              <label>Senha</label>
              <input name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handleChange} required />
            </div>
          </div>

          {/* ENDEREÇO */}
          <div className="auth-secao-titulo" style={{ marginTop: '8px' }}>Endereço de entrega</div>
          <div className="auth-grid-2">
            <div className="auth-grupo">
              <label>CEP</label>
              <input name="cep" placeholder="00000-000" value={form.endereco.cep} onChange={handleEndereco} />
            </div>
            <div className="auth-grupo">
              <label>Estado</label>
              <input name="estado" placeholder="PA" value={form.endereco.estado} onChange={handleEndereco} />
            </div>
          </div>
          <div className="auth-grupo">
            <label>Rua</label>
            <input name="rua" placeholder="Nome da rua" value={form.endereco.rua} onChange={handleEndereco} />
          </div>
          <div className="auth-grid-3">
            <div className="auth-grupo">
              <label>Número</label>
              <input name="numero" placeholder="123" value={form.endereco.numero} onChange={handleEndereco} />
            </div>
            <div className="auth-grupo">
              <label>Complemento</label>
              <input name="complemento" placeholder="Apto 101" value={form.endereco.complemento} onChange={handleEndereco} />
            </div>
            <div className="auth-grupo">
              <label>Bairro</label>
              <input name="bairro" placeholder="Bairro" value={form.endereco.bairro} onChange={handleEndereco} />
            </div>
          </div>
          <div className="auth-grupo">
            <label>Cidade</label>
            <input name="cidade" placeholder="Sua cidade" value={form.endereco.cidade} onChange={handleEndereco} />
          </div>

          {erro && <p className="auth-erro">{erro}</p>}
          {sucesso && <p className="auth-sucesso">{sucesso}</p>}

          <button type="submit" className="auth-btn" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-link">
          Já tem cadastro? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;