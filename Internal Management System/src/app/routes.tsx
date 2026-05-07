import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Colaboradores } from './pages/Colaboradores';
import { Carros } from './pages/Carros';
import { Relatorios } from './pages/Relatorios';
import { Financeiro } from './pages/Financeiro';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'colaboradores',
        element: (
          <PrivateRoute cargosPermitidos={['Gerente', 'Gerente Financeiro', 'Dono']}>
            <Colaboradores />
          </PrivateRoute>
        ),
      },
      {
        path: 'carros',
        element: <Carros />,
      },
      {
        path: 'relatorios',
        element: <Relatorios />,
      },
      {
        path: 'financeiro',
        element: (
          <PrivateRoute cargosPermitidos={['Gerente Financeiro', 'Dono']}>
            <Financeiro />
          </PrivateRoute>
        ),
      },
    ],
  },
]);