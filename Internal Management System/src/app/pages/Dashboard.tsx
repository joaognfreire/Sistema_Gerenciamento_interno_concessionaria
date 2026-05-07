import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Car, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { getUsuarios, getCarros, getRegistrosFinanceiros } from '../services/mockData';

export const Dashboard: React.FC = () => {
  const { usuario, temPermissao } = useAuth();
  const usuarios = getUsuarios();
  const carros = getCarros();
  const registros = getRegistrosFinanceiros();

  const colaboradoresAtivos = usuarios.filter(u => u.ativo).length;
  const carrosDisponiveis = carros.filter(c => c.status === 'Disponível').length;
  
  const entradas = registros
    .filter(r => r.tipo === 'Entrada')
    .reduce((sum, r) => sum + r.valor, 0);
  
  const saidas = registros
    .filter(r => r.tipo === 'Saída')
    .reduce((sum, r) => sum + r.valor, 0);
  
  const saldo = entradas - saidas;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Bem-vindo, {usuario?.nome}!</h1>
        <p className="text-slate-600 mt-1">
          Aqui está um resumo do sistema
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {temPermissao(['Gerente', 'Gerente Financeiro', 'Dono']) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Colaboradores Ativos
              </CardTitle>
              <Users className="w-4 h-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{colaboradoresAtivos}</div>
              <p className="text-xs text-slate-600 mt-1">
                Total de funcionários
              </p>
            </CardContent>
          </Card>
        )}

        {temPermissao(['Gerente', 'Gerente Financeiro', 'Dono']) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Carros Disponíveis
              </CardTitle>
              <Car className="w-4 h-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carrosDisponiveis}</div>
              <p className="text-xs text-slate-600 mt-1">
                De {carros.length} no total
              </p>
            </CardContent>
          </Card>
        )}

        {temPermissao(['Gerente Financeiro', 'Dono']) && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Entradas
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {entradas.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Receitas totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Saídas
                </CardTitle>
                <TrendingDown className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {saidas.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Despesas totais
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {temPermissao(['Gerente Financeiro', 'Dono']) && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>
                Saldo consolidado do período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Entradas</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {entradas.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Saídas</span>
                  <span className="text-lg font-bold text-red-600">
                    R$ {saidas.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <span className="text-sm font-medium">Saldo</span>
                  <span className={`text-lg font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    R$ {saldo.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {temPermissao(['Gerente', 'Gerente Financeiro', 'Dono']) && (
          <Card>
            <CardHeader>
              <CardTitle>Status dos Veículos</CardTitle>
              <CardDescription>
                Distribuição por status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Disponíveis</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ 
                          width: `${(carros.filter(c => c.status === 'Disponível').length / carros.length) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {carros.filter(c => c.status === 'Disponível').length}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Vendidos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ 
                          width: `${(carros.filter(c => c.status === 'Vendido').length / carros.length) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {carros.filter(c => c.status === 'Vendido').length}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Em Manutenção</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500"
                        style={{ 
                          width: `${(carros.filter(c => c.status === 'Manutenção').length / carros.length) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {carros.filter(c => c.status === 'Manutenção').length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Usuário:</strong> {usuario?.nome}</p>
            <p><strong>Cargo:</strong> {usuario?.cargo}</p>
            <p><strong>CPF:</strong> {usuario?.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</p>
            <p className="text-slate-600 mt-4">
              Este é um sistema de demonstração. Os dados são armazenados localmente no navegador.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
