import React, { useState, useEffect } from 'react';
import { Carro } from '../types';
import { getCarros, saveCarros } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus, Pencil, Trash2, Search, Car as CarIcon, Image as ImageIcon, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const Carros: React.FC = () => {
  const { usuario, temPermissao } = useAuth();
  const [carros, setCarros] = useState<Carro[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogVisualizarAberto, setDialogVisualizarAberto] = useState(false);
  const [carroEditando, setCarroEditando] = useState<Carro | null>(null);
  const [carroVisualizando, setCarroVisualizando] = useState<Carro | null>(null);

  const ehColaborador = usuario?.cargo === 'Colaborador';
  const podeEditar = temPermissao(['Gerente', 'Gerente Financeiro', 'Dono']);

  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    cor: '',
    quilometragem: '',
    chassi: '',
    renavam: '',
    categoria: '',
    valorCompra: '',
    valorVenda: '',
    dataCompra: '',
    dataVenda: '',
    status: 'Disponível' as Carro['status'],
    observacoes: '',
    imagens: [] as string[],
  });

  useEffect(() => {
    carregarCarros();
  }, []);

  const carregarCarros = () => {
    setCarros(getCarros());
  };

  const limparFormulario = () => {
    setFormData({
      marca: '',
      modelo: '',
      ano: '',
      placa: '',
      cor: '',
      quilometragem: '',
      chassi: '',
      renavam: '',
      categoria: '',
      valorCompra: '',
      valorVenda: '',
      dataCompra: '',
      dataVenda: '',
      status: 'Disponível',
      observacoes: '',
      imagens: [],
    });
    setCarroEditando(null);
  };

  const abrirDialogNovo = () => {
    limparFormulario();
    setDialogAberto(true);
  };

  const abrirDialogEditar = (carro: Carro) => {
    setCarroEditando(carro);
    setFormData({
      marca: carro.marca,
      modelo: carro.modelo,
      ano: carro.ano.toString(),
      placa: carro.placa,
      cor: carro.cor,
      quilometragem: carro.quilometragem.toString(),
      chassi: carro.chassi,
      renavam: carro.renavam,
      categoria: carro.categoria,
      valorCompra: carro.valorCompra.toString(),
      valorVenda: carro.valorVenda?.toString() || '',
      dataCompra: carro.dataCompra,
      dataVenda: carro.dataVenda || '',
      status: carro.status,
      observacoes: carro.observacoes || '',
      imagens: carro.imagens || [],
    });
    setDialogAberto(true);
  };

  const abrirDialogVisualizar = (carro: Carro) => {
    setCarroVisualizando(carro);
    setDialogVisualizarAberto(true);
  };

  const handleImagemUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          imagens: [...prev.imagens, base64String],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removerImagem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const carrosAtuais = getCarros();

    if (carroEditando) {
      // Editar
      const index = carrosAtuais.findIndex(c => c.id === carroEditando.id);
      if (index !== -1) {
        carrosAtuais[index] = {
          ...carroEditando,
          marca: formData.marca,
          modelo: formData.modelo,
          ano: parseInt(formData.ano),
          placa: formData.placa,
          cor: formData.cor,
          quilometragem: parseInt(formData.quilometragem),
          chassi: formData.chassi,
          renavam: formData.renavam,
          categoria: formData.categoria,
          valorCompra: parseFloat(formData.valorCompra),
          valorVenda: formData.valorVenda ? parseFloat(formData.valorVenda) : undefined,
          dataCompra: formData.dataCompra,
          dataVenda: formData.dataVenda || undefined,
          status: formData.status,
          observacoes: formData.observacoes,
          imagens: formData.imagens,
        };
        saveCarros(carrosAtuais);
        toast.success('Carro atualizado com sucesso!');
      }
    } else {
      // Novo
      const novoCarro: Carro = {
        id: Date.now().toString(),
        marca: formData.marca,
        modelo: formData.modelo,
        ano: parseInt(formData.ano),
        placa: formData.placa,
        cor: formData.cor,
        quilometragem: parseInt(formData.quilometragem),
        chassi: formData.chassi,
        renavam: formData.renavam,
        categoria: formData.categoria,
        valorCompra: parseFloat(formData.valorCompra),
        valorVenda: formData.valorVenda ? parseFloat(formData.valorVenda) : undefined,
        dataCompra: formData.dataCompra,
        dataVenda: formData.dataVenda || undefined,
        status: formData.status,
        imagens: formData.imagens,
        observacoes: formData.observacoes,
      };
      carrosAtuais.push(novoCarro);
      saveCarros(carrosAtuais);
      toast.success('Carro cadastrado com sucesso!');
    }

    carregarCarros();
    setDialogAberto(false);
    limparFormulario();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este carro?')) {
      const carrosAtuais = getCarros().filter(c => c.id !== id);
      saveCarros(carrosAtuais);
      carregarCarros();
      toast.success('Carro excluído com sucesso!');
    }
  };

  const carrosFiltrados = carros.filter(c => {
    const matchBusca = 
      c.marca.toLowerCase().includes(busca.toLowerCase()) ||
      c.modelo.toLowerCase().includes(busca.toLowerCase()) ||
      c.placa.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  const getBadgeVariant = (status: Carro['status']) => {
    switch (status) {
      case 'Disponível':
        return 'default';
      case 'Vendido':
        return 'secondary';
      case 'Manutenção':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Carros</h1>
          <p className="text-slate-600 mt-1">
            {ehColaborador ? 'Visualize o estoque de veículos' : 'Gerencie o estoque de veículos'}
          </p>
        </div>
        {podeEditar && (
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button onClick={abrirDialogNovo}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Carro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {carroEditando ? 'Editar Carro' : 'Novo Carro'}
                </DialogTitle>
                <DialogDescription>
                  {carroEditando 
                    ? 'Atualize as informações do veículo' 
                    : 'Preencha os dados do novo veículo'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca *</Label>
                      <Input
                        id="marca"
                        value={formData.marca}
                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modelo">Modelo *</Label>
                      <Input
                        id="modelo"
                        value={formData.modelo}
                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ano">Ano *</Label>
                      <Input
                        id="ano"
                        type="number"
                        value={formData.ano}
                        onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placa">Placa *</Label>
                      <Input
                        id="placa"
                        value={formData.placa}
                        onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                        placeholder="ABC1D23"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cor">Cor *</Label>
                      <Input
                        id="cor"
                        value={formData.cor}
                        onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Input
                        id="categoria"
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        placeholder="Sedan, SUV, etc."
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Documentação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chassi">Chassi *</Label>
                      <Input
                        id="chassi"
                        value={formData.chassi}
                        onChange={(e) => setFormData({ ...formData, chassi: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="renavam">Renavam *</Label>
                      <Input
                        id="renavam"
                        value={formData.renavam}
                        onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quilometragem">Quilometragem *</Label>
                      <Input
                        id="quilometragem"
                        type="number"
                        value={formData.quilometragem}
                        onChange={(e) => setFormData({ ...formData, quilometragem: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as Carro['status'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Disponível">Disponível</SelectItem>
                          <SelectItem value="Vendido">Vendido</SelectItem>
                          <SelectItem value="Manutenção">Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Valores e Datas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valorCompra">Valor de Compra (R$) *</Label>
                      <Input
                        id="valorCompra"
                        type="number"
                        step="0.01"
                        value={formData.valorCompra}
                        onChange={(e) => setFormData({ ...formData, valorCompra: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valorVenda">Valor de Venda (R$)</Label>
                      <Input
                        id="valorVenda"
                        type="number"
                        step="0.01"
                        value={formData.valorVenda}
                        onChange={(e) => setFormData({ ...formData, valorVenda: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataCompra">Data de Compra *</Label>
                      <Input
                        id="dataCompra"
                        type="date"
                        value={formData.dataCompra}
                        onChange={(e) => setFormData({ ...formData, dataCompra: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataVenda">Data de Venda</Label>
                      <Input
                        id="dataVenda"
                        type="date"
                        value={formData.dataVenda}
                        onChange={(e) => setFormData({ ...formData, dataVenda: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Fotos do Veículo</h3>
                  <div className="space-y-2">
                    <Label htmlFor="imagens">Adicionar Fotos</Label>
                    <Input
                      id="imagens"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagemUpload}
                    />
                    <p className="text-xs text-slate-500">
                      Você pode selecionar múltiplas imagens
                    </p>
                  </div>

                  {formData.imagens.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.imagens.map((imagem, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imagem}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removerImagem(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                    placeholder="Informações adicionais sobre o veículo..."
                  />
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
                    {carroEditando ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Estoque de Veículos</CardTitle>
              <CardDescription>
                {carrosFiltrados.length} veículos no estoque
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar carro..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Vendido">Vendido</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {carrosFiltrados.map((carro) => (
              <Card key={carro.id} className="overflow-hidden">
                <div className="aspect-video bg-slate-100 flex items-center justify-center">
                  {carro.imagens.length > 0 ? (
                    <img 
                      src={carro.imagens[0]} 
                      alt={`${carro.marca} ${carro.modelo}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <CarIcon className="w-12 h-12" />
                      <span className="text-sm">Sem imagem</span>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {carro.marca} {carro.modelo}
                      </CardTitle>
                      <CardDescription>{carro.ano} • {carro.categoria}</CardDescription>
                    </div>
                    <Badge variant={getBadgeVariant(carro.status)}>
                      {carro.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-slate-500">Placa</p>
                      <p className="font-medium">{carro.placa}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Cor</p>
                      <p className="font-medium">{carro.cor}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">KM</p>
                      <p className="font-medium">{carro.quilometragem.toLocaleString('pt-BR')}</p>
                    </div>
                    {!ehColaborador && (
                      <div>
                        <p className="text-slate-500">Valor</p>
                        <p className="font-medium">
                          R$ {carro.valorCompra.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    {ehColaborador ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => abrirDialogVisualizar(carro)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => abrirDialogEditar(carro)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExcluir(carro.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {carrosFiltrados.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                Nenhum veículo encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Visualização (apenas para colaboradores) */}
      <Dialog open={dialogVisualizarAberto} onOpenChange={setDialogVisualizarAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Veículo</DialogTitle>
            <DialogDescription>
              Informações completas do veículo
            </DialogDescription>
          </DialogHeader>
          {carroVisualizando && (
            <div className="space-y-6">
              {carroVisualizando.imagens.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Fotos do Veículo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {carroVisualizando.imagens.map((imagem, index) => (
                      <img
                        key={index}
                        src={imagem}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-medium">Informações Básicas</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Marca</p>
                    <p className="font-medium">{carroVisualizando.marca}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Modelo</p>
                    <p className="font-medium">{carroVisualizando.modelo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Ano</p>
                    <p className="font-medium">{carroVisualizando.ano}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Placa</p>
                    <p className="font-medium">{carroVisualizando.placa}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Cor</p>
                    <p className="font-medium">{carroVisualizando.cor}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Categoria</p>
                    <p className="font-medium">{carroVisualizando.categoria}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Documentação</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Chassi</p>
                    <p className="font-medium">{carroVisualizando.chassi}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Renavam</p>
                    <p className="font-medium">{carroVisualizando.renavam}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Quilometragem</p>
                    <p className="font-medium">{carroVisualizando.quilometragem.toLocaleString('pt-BR')} km</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <Badge variant={getBadgeVariant(carroVisualizando.status)}>
                      {carroVisualizando.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {carroVisualizando.observacoes && (
                <div className="space-y-2">
                  <h3 className="font-medium">Observações</h3>
                  <p className="text-sm text-slate-600">{carroVisualizando.observacoes}</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setDialogVisualizarAberto(false)}
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};