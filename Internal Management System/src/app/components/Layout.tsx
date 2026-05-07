import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { 
  Building2, 
  Users, 
  Car, 
  DollarSign, 
  LayoutDashboard, 
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { usuario, logout, temPermissao } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      permissoes: ['Colaborador', 'Gerente', 'Gerente Financeiro', 'Dono'],
    },
    {
      label: 'Colaboradores',
      icon: Users,
      path: '/colaboradores',
      permissoes: ['Gerente', 'Gerente Financeiro', 'Dono'],
    },
    {
      label: 'Carros',
      icon: Car,
      path: '/carros',
      permissoes: ['Colaborador', 'Gerente', 'Gerente Financeiro', 'Dono'],
    },
    {
      label: 'Relatórios',
      icon: FileText,
      path: '/relatorios',
      permissoes: ['Colaborador', 'Gerente', 'Gerente Financeiro', 'Dono'],
    },
    {
      label: 'Financeiro',
      icon: DollarSign,
      path: '/financeiro',
      permissoes: ['Gerente Financeiro', 'Dono'],
    },
  ];

  const menuItemsFiltrados = menuItems.filter((item) =>
    temPermissao(item.permissoes as any)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">Sistema Interno</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transition-transform duration-300',
          'lg:translate-x-0',
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Sistema Interno</h1>
                <p className="text-xs text-slate-500">Gestão Empresarial</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {usuario?.nome.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{usuario?.nome}</p>
                <p className="text-xs text-slate-500">{usuario?.cargo}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItemsFiltrados.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setMenuAberto(false);
                  }}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {menuAberto && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};