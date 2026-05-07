import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, Usuario, Cargo } from '../types';
import { getUsuarios, initializeLocalStorage } from '../services/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    // Inicializar localStorage
    initializeLocalStorage();

    // Verificar se há usuário logado
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  const login = async (cpf: string, senha: string): Promise<boolean> => {
    // Remover formatação do CPF
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    const usuarios = getUsuarios();
    const usuarioEncontrado = usuarios.find(
      (u) => u.cpf === cpfLimpo && u.senha === senha && u.ativo
    );

    if (usuarioEncontrado) {
      setUsuario(usuarioEncontrado);
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuarioLogado');
  };

  const temPermissao = (cargosPermitidos: Cargo[]): boolean => {
    if (!usuario) return false;
    return cargosPermitidos.includes(usuario.cargo);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, temPermissao }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
