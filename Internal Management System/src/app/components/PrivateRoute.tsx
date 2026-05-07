import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Cargo } from '../types';

interface PrivateRouteProps {
  children: React.ReactNode;
  cargosPermitidos?: Cargo[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  cargosPermitidos 
}) => {
  const { usuario, temPermissao } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (cargosPermitidos && !temPermissao(cargosPermitidos)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
