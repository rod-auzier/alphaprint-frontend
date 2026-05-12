import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Perfil from './pages/Perfil';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Carrinho from './pages/Carrinho';
import MeusPedidos from './pages/MeusPedidos';
import Produto from './pages/Produto';
import Admin from './pages/Admin';
import Pagamento from './pages/Pagamento';
import Header from './components/Header';
import Footer from './components/Footer';
import { RotaProtegida, RotaAdmin } from './components/RotaProtegida';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={
          <RotaProtegida><Perfil /></RotaProtegida>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/produto/:id" element={<Produto />} />
        <Route path="/carrinho" element={
          <RotaProtegida><Carrinho /></RotaProtegida>
        } />
        <Route path="/pagamento" element={
          <RotaProtegida><Pagamento /></RotaProtegida>
        } />
        <Route path="/meus-pedidos" element={
          <RotaProtegida><MeusPedidos /></RotaProtegida>
        } />
        <Route path="/admin" element={
          <RotaAdmin><Admin /></RotaAdmin>
        } />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;