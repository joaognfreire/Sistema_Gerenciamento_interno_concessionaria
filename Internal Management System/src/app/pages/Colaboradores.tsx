import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Usuario, Cargo } from '../types';
import { getUsuarios, saveUsuarios } from '../services/mockData';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export const Colaboradores: React.FC = () => {
  const { usuario: usuarioLogado } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    senha: '',
    cargo: 'Colaborador' as Cargo,
    email: '',
    telefone: '',
    dataNascimento: '',
    dataAdmissao: '',
    salario: '',
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = () => {
    setUsuarios(getUsuarios());
  };

  const limparFormulario = () => {
    setFormData({
      nome: '',
      cpf: '',
      senha: '',
      cargo: 'Colaborador',
      email: '',
      telefone: '',
      dataNascimento: '',
      dataAdmissao: '',
      salario: '',
    });
    setUsuarioEditando(null);
  };

  const abrirDialogNovo = () => {
    limparFormulario();
    setDialogAberto(true);
  };

  const abrirDialogEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nome: usuario.nome,
      cpf: usuario.cpf,
      senha: usuario.senha,
      cargo: usuario.cargo,
      email: usuario.email,
      telefone: usuario.telefone,
      dataNascimento: usuario.dataNascimento,
      dataAdmissao: usuario.dataAdmissao,
      salario: usuario.salario?.toString() || '',
    });
    setDialogAberto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cpfLimpo = formData.cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) {
      toast.error('CPF inválido');
      return;
    }

    const usuariosAtuais = getUsuarios();
    
    if (usuarioEditando) {
      // Editar
      const index = usuariosAtuais.findIndex(u => u.id === usuarioEditando.id);
      if (index !== -1) {
        usuariosAtuais[index] = {
          ...usuarioEditando,
          ...formData,
          cpf: cpfLimpo,
          salario: formData.salario ? parseFloat(formData.salario) : undefined,
        };
        saveUsuarios(usuariosAtuais);
        toast.success('Colaborador atualizado com sucesso!');
      }
    } else {
      // Novo
      const novoUsuario: Usuario = {
        id: Date.now().toString(),
        ...formData,
        cpf: cpfLimpo,
        salario: formData.salario ? parseFloat(formData.salario) : undefined,
        ativo: true,
      };
      usuariosAtuais.push(novoUsuario);
      saveUsuarios(usuariosAtuais);
      toast.success('Colaborador cadastrado com sucesso!');
    }

    carregarUsuarios();
    setDialogAberto(false);
    limparFormulario();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
      const usuariosAtuais = getUsuarios();
      const index = usuariosAtuais.findIndex(u => u.id === id);
      if (index !== -1) {
        usuariosAtuais[index].ativo = false;
        saveUsuarios(usuariosAtuais);
        carregarUsuarios();
        toast.success('Colaborador desativado com sucesso!');
      }
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.ativo && (
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.cpf.includes(busca.replace(/\D/g, '')) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
    )
  );

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatTelefone = (telefone: string) => {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Colaboradores</h1>
          <p className="text-slate-600 mt-1">
            Gerencie os colaboradores da empresa
          </p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={abrirDialogNovo}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {usuarioEditando ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
              <DialogDescription>
                {usuarioEditando 
                  ? 'Atualize as informações do colaborador' 
                  : 'Preencha os dados do novo colaborador'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha *</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo *</Label>
                  <Select
                    value={formData.cargo}
                    onValueChange={(value) => setFormData({ ...formData, cargo: value as Cargo })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Colaborador">Colaborador</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="Gerente Financeiro">Gerente Financeiro</SelectItem>
                      {usuarioLogado?.cargo === 'Dono' && (
                        <SelectItem value="Dono">Dono</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
                  <Input
                    id="dataAdmissao"
                    type="date"
                    value={formData.dataAdmissao}
                    onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="salario">Salário (R$)</Label>
                  <Input
                    id="salario"
                    type="number"
                    step="0.01"
                    value={formData.salario}
                    onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {usuarioEditando ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Lista de Colaboradores</CardTitle>
              <CardDescription>
                {usuariosFiltrados.length} colaboradores ativos
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar colaborador..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Admissão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{formatCPF(usuario.cpf)}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{usuario.cargo}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(usuario.dataAdmissao).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirDialogEditar(usuario)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExcluir(usuario.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      Nenhum colaborador encontrado
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
