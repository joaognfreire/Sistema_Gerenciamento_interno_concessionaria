import React, { useState, useEffect } from 'react';
import { Relatorio } from '../types';
import { getRelatorios, saveRelatorios, getCarros } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, FileText, AlertCircle, Clock, CheckCircle, Archive, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const Relatorios: React.FC = () => {
  const { usuario, temPermissao } = useAuth();
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogRespostaAberto, setDialogRespostaAberto] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [resposta, setResposta] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    prioridade: 'Média' as Relatorio['prioridade'],
    carroId: '',
  });

  const ehColaborador = usuario?.cargo === 'Colaborador';
  const ehDono = usuario?.cargo === 'Dono';

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const carregarRelatorios = () => {
    const todosRelatorios = getRelatorios().sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    // Colaboradores veem apenas seus próprios relatórios
    if (ehColaborador) {
      setRelatorios(todosRelatorios.filter(r => r.autorId === usuario?.id));
    } else {
      setRelatorios(todosRelatorios);
    }
  };

  const limparFormulario = () => {
    setFormData({
      titulo: '',
      descricao: '',
      categoria: '',
      prioridade: 'Média',
      carroId: '',
    });
  };

  const abrirDialogNovo = () => {
    limparFormulario();
    setDialogAberto(true);
  };

  const abrirDialogResposta = (relatorio: Relatorio) => {
    setRelatorioSelecionado(relatorio);
    setResposta('');
    setDialogRespostaAberto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario) return;

    const relatoriosAtuais = getRelatorios();
    
    const novoRelatorio: Relatorio = {
      id: Date.now().toString(),
      titulo: formData.titulo,
      descricao: formData.descricao,
      categoria: formData.categoria,
      prioridade: formData.prioridade,
      status: 'Pendente',
      data: new Date().toISOString().split('T')[0],
      autorId: usuario.id,
      autorNome: usuario.nome,
      carroId: formData.carroId || undefined,
    };
    
    relatoriosAtuais.push(novoRelatorio);
    saveRelatorios(relatoriosAtuais);
    toast.success('Relatório enviado com sucesso!');

    carregarRelatorios();
    setDialogAberto(false);
    limparFormulario();
  };

  const handleResponder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!relatorioSelecionado || !resposta.trim()) return;

    const relatoriosAtuais = getRelatorios();
    const index = relatoriosAtuais.findIndex(r => r.id === relatorioSelecionado.id);
    
    if (index !== -1) {
      relatoriosAtuais[index] = {
        ...relatoriosAtuais[index],
        respostaDono: resposta,
        dataResposta: new Date().toISOString().split('T')[0],
        status: 'Em Análise',
      };
      saveRelatorios(relatoriosAtuais);
      toast.success('Resposta enviada com sucesso!');
      carregarRelatorios();
    }

    setDialogRespostaAberto(false);
    setRelatorioSelecionado(null);
    setResposta('');
  };

  const handleMudarStatus = (relatorioId: string, novoStatus: Relatorio['status']) => {
    const relatoriosAtuais = getRelatorios();
    const index = relatoriosAtuais.findIndex(r => r.id === relatorioId);
    
    if (index !== -1) {
      relatoriosAtuais[index] = {
        ...relatoriosAtuais[index],
        status: novoStatus,
      };
      saveRelatorios(relatoriosAtuais);
      toast.success('Status atualizado!');
      carregarRelatorios();
    }
  };

  const relatoriosFiltrados = relatorios.filter(r => 
    filtroStatus === 'todos' || r.status === filtroStatus
  );

  const carros = getCarros();

  const getPrioridadeColor = (prioridade: Relatorio['prioridade']) => {
    switch (prioridade) {
      case 'Urgente':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Alta':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Média':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Baixa':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: Relatorio['status']) => {
    switch (status) {
      case 'Pendente':
        return <Clock className="w-4 h-4" />;
      case 'Em Análise':
        return <AlertCircle className="w-4 h-4" />;
      case 'Resolvido':
        return <CheckCircle className="w-4 h-4" />;
      case 'Arquivado':
        return <Archive className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const categorias = [
    'Manutenção',
    'Documentação',
    'Problema Técnico',
    'Sugestão',
    'Reclamação',
    'Outro',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Relatórios</h1>
          <p className="text-slate-600 mt-1">
            {ehColaborador 
              ? 'Envie relatórios e acompanhe suas solicitações'
              : 'Gerencie todos os relatórios dos colaboradores'}
          </p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={abrirDialogNovo}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Relatório</DialogTitle>
              <DialogDescription>
                Preencha as informações do relatório que será enviado ao dono
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Resumo do problema ou solicitação"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição Detalhada *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={5}
                  placeholder="Descreva detalhadamente o problema, sugestão ou solicitação..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade *</Label>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(value) => setFormData({ ...formData, prioridade: value as Relatorio['prioridade'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carroId">Veículo Relacionado (Opcional)</Label>
                <Select
                  value={formData.carroId}
                  onValueChange={(value) => setFormData({ ...formData, carroId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo se aplicável" />
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

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Enviar Relatório
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>
                {ehColaborador ? 'Meus Relatórios' : 'Todos os Relatórios'}
              </CardTitle>
              <CardDescription>
                {relatoriosFiltrados.length} relatório(s) {filtroStatus !== 'todos' ? `com status: ${filtroStatus}` : ''}
              </CardDescription>
            </div>
            <Tabs value={filtroStatus} onValueChange={setFiltroStatus}>
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="Pendente">Pendentes</TabsTrigger>
                <TabsTrigger value="Em Análise">Em Análise</TabsTrigger>
                <TabsTrigger value="Resolvido">Resolvidos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relatoriosFiltrados.map((relatorio) => {
              const carro = relatorio.carroId ? carros.find(c => c.id === relatorio.carroId) : null;
              
              return (
                <Card key={relatorio.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getStatusIcon(relatorio.status)}
                            {relatorio.status}
                          </Badge>
                          <Badge className={getPrioridadeColor(relatorio.prioridade)}>
                            {relatorio.prioridade}
                          </Badge>
                          <Badge variant="secondary">{relatorio.categoria}</Badge>
                        </div>
                        <CardTitle className="text-lg">{relatorio.titulo}</CardTitle>
                        <CardDescription className="mt-1">
                          Por {relatorio.autorNome} • {new Date(relatorio.data).toLocaleDateString('pt-BR')}
                          {carro && ` • ${carro.marca} ${carro.modelo} (${carro.placa})`}
                        </CardDescription>
                      </div>
                      {!ehColaborador && relatorio.status !== 'Resolvido' && relatorio.status !== 'Arquivado' && (
                        <div className="flex gap-2">
                          {ehDono && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirDialogResposta(relatorio)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Responder
                            </Button>
                          )}
                          <Select
                            value={relatorio.status}
                            onValueChange={(value) => handleMudarStatus(relatorio.id, value as Relatorio['status'])}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendente">Pendente</SelectItem>
                              <SelectItem value="Em Análise">Em Análise</SelectItem>
                              <SelectItem value="Resolvido">Resolvido</SelectItem>
                              <SelectItem value="Arquivado">Arquivado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {relatorio.descricao}
                      </p>
                    </div>
                    
                    {relatorio.respostaDono && (
                      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-sm text-blue-900">
                            Resposta do Dono
                          </span>
                          {relatorio.dataResposta && (
                            <span className="text-xs text-blue-600">
                              • {new Date(relatorio.dataResposta).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-blue-900 whitespace-pre-wrap">
                          {relatorio.respostaDono}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {relatoriosFiltrados.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum relatório encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Resposta (apenas para Dono) */}
      <Dialog open={dialogRespostaAberto} onOpenChange={setDialogRespostaAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder Relatório</DialogTitle>
            <DialogDescription>
              Envie uma resposta para {relatorioSelecionado?.autorNome}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResponder} className="space-y-4">
            {relatorioSelecionado && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-sm mb-1">{relatorioSelecionado.titulo}</p>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {relatorioSelecionado.descricao}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="resposta">Sua Resposta *</Label>
              <Textarea
                id="resposta"
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                rows={5}
                placeholder="Digite sua resposta..."
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogRespostaAberto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Enviar Resposta
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
