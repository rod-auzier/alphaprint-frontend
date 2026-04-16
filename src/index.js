import React from 'react';
import './styles/global.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CarrinhoProvider } from './context/CarrinhoContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <CarrinhoProvider>
      <App />
    </CarrinhoProvider>
  </AuthProvider>
);