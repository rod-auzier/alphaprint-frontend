import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RotaProtegida({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export function RotaAdmin({ children }) {
  const { token, usuario } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (usuario?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
}