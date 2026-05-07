import React, { useState, useEffect } from 'react';
import { RegistroFinanceiro } from '../types';
import { getRegistrosFinanceiros, saveRegistrosFinanceiros, getCarros } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, TrendingUp, TrendingDown, DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Financeiro: React.FC = () => {
  const { usuario } = useAuth();
  const [registros, setRegistros] = useState<RegistroFinanceiro[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'Entrada' | 'Saída'>('todos');
  const [registroEditando, setRegistroEditando] = useState<RegistroFinanceiro | null>(null);

  const [formData, setFormData] = useState({
    tipo: 'Entrada' as 'Entrada' | 'Saída',
    categoria: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    carroId: '',
  });

  useEffect(() => {
    carregarRegistros();
  }, []);

  const carregarRegistros = () => {
    const registrosOrdenados = getRegistrosFinanceiros().sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    setRegistros(registrosOrdenados);
  };

  const limparFormulario = () => {
    setFormData({
      tipo: 'Entrada',
      categoria: '',
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      carroId: '',
    });
    setRegistroEditando(null);
  };

  const abrirDialogNovo = () => {
    limparFormulario();
    setDialogAberto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario) return;

    const registrosAtuais = getRegistrosFinanceiros();
    
    if (registroEditando) {
      // Editar (não implementado neste exemplo)
      toast.info('Funcionalidade de edição não implementada');
    } else {
      // Novo
      const novoRegistro: RegistroFinanceiro = {
        id: Date.now().toString(),
        tipo: formData.tipo,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data: formData.data,
        carroId: formData.carroId || undefined,
        responsavel: usuario.nome,
      };
      registrosAtuais.push(novoRegistro);
      saveRegistrosFinanceiros(registrosAtuais);
      toast.success('Registro financeiro adicionado com sucesso!');
    }

    carregarRegistros();
    setDialogAberto(false);
    limparFormulario();
  };

  const registrosFiltrados = registros.filter(r => 
    filtroTipo === 'todos' || r.tipo === filtroTipo
  );

  const totalEntradas = registros
    .filter(r => r.tipo === 'Entrada')
    .reduce((sum, r) => sum + r.valor, 0);

  const totalSaidas = registros
    .filter(r => r.tipo === 'Saída')
    .reduce((sum, r) => sum + r.valor, 0);

  const saldo = totalEntradas - totalSaidas;

  const carros = getCarros();

  const categoriasPorTipo = {
    Entrada: [
      'Venda de Veículo',
      'Entrada de Capital',
      'Outros Recebimentos',
    ],
    Saída: [
      'Compra de Veículo',
      'Manutenção',
      'Folha de Pagamento',
      'Despesas Operacionais',
      'Impostos e Taxas',
      'Outras Despesas',
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Financeiro</h1>
          <p className="text-slate-600 mt-1">
            Gestão financeira da empresa
          </p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={abrirDialogNovo}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Registro Financeiro</DialogTitle>
              <DialogDescription>
                Adicione uma entrada ou saída financeira
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    tipo: value as 'Entrada' | 'Saída',
                    categoria: '' // Reset categoria ao mudar tipo
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entrada">Entrada</SelectItem>
                    <SelectItem value="Saída">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasPorTipo[formData.tipo].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
              </div>

              {(formData.categoria === 'Compra de Veículo' || formData.categoria === 'Venda de Veículo') && (
                <div className="space-y-2">
                  <Label htmlFor="carroId">Veículo (Opcional)</Label>
                  <Select
                    value={formData.carroId}
                    onValueChange={(value) => setFormData({ ...formData, carroId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {carros.map((carro) => (
                        <SelectItem key={carro.id} value={carro.id}>
                          {carro.marca} {carro.modelo} - {carro.placa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Adicionar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Entradas
            </CardTitle>
            <ArrowUpCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Receitas totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Saídas
            </CardTitle>
            <ArrowDownCircle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Despesas totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Saldo
            </CardTitle>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Resultado consolidado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Registros Financeiros</CardTitle>
              <CardDescription>
                Histórico de movimentações financeiras
              </CardDescription>
            </div>
            <Tabs value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as any)}>
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="Entrada">Entradas</TabsTrigger>
                <TabsTrigger value="Saída">Saídas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrosFiltrados.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell>
                      {new Date(registro.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={registro.tipo === 'Entrada' ? 'default' : 'destructive'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {registro.tipo === 'Entrada' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {registro.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{registro.categoria}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {registro.descricao}
                    </TableCell>
                    <TableCell>{registro.responsavel}</TableCell>
                    <TableCell 
                      className={`text-right font-medium ${
                        registro.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {registro.tipo === 'Entrada' ? '+' : '-'} R$ {registro.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                {registrosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
