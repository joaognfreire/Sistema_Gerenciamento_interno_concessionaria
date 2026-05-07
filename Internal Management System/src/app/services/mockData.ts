import { Usuario, Carro, RegistroFinanceiro, Relatorio } from '../types';

// Usuários iniciais do sistema
export const usuariosIniciais: Usuario[] = [
  {
    id: '1',
    nome: 'João Silva',
    cpf: '12345678900',
    senha: '123456',
    cargo: 'Dono',
    email: 'joao@empresa.com',
    telefone: '(11) 99999-9999',
    dataNascimento: '1980-01-15',
    dataAdmissao: '2020-01-01',
    salario: 15000,
    ativo: true,
  },
  {
    id: '2',
    nome: 'Maria Santos',
    cpf: '98765432100',
    senha: '123456',
    cargo: 'Gerente Financeiro',
    email: 'maria@empresa.com',
    telefone: '(11) 98888-8888',
    dataNascimento: '1985-05-20',
    dataAdmissao: '2020-03-01',
    salario: 8000,
    ativo: true,
  },
  {
    id: '3',
    nome: 'Carlos Oliveira',
    cpf: '11122233344',
    senha: '123456',
    cargo: 'Gerente',
    email: 'carlos@empresa.com',
    telefone: '(11) 97777-7777',
    dataNascimento: '1990-08-10',
    dataAdmissao: '2021-01-15',
    salario: 6000,
    ativo: true,
  },
  {
    id: '4',
    nome: 'Ana Paula',
    cpf: '55566677788',
    senha: '123456',
    cargo: 'Colaborador',
    email: 'ana@empresa.com',
    telefone: '(11) 96666-6666',
    dataNascimento: '1995-12-03',
    dataAdmissao: '2022-06-01',
    salario: 3000,
    ativo: true,
  },
];

// Carros iniciais
export const carrosIniciais: Carro[] = [
  {
    id: '1',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: 2022,
    placa: 'ABC1D23',
    cor: 'Prata',
    quilometragem: 25000,
    chassi: '9BWZZZ377VT004251',
    renavam: '12345678901',
    categoria: 'Sedan',
    valorCompra: 95000,
    valorVenda: 110000,
    dataCompra: '2022-01-15',
    status: 'Disponível',
    imagens: [],
    observacoes: 'Veículo em excelente estado, revisões em dia',
  },
  {
    id: '2',
    marca: 'Honda',
    modelo: 'Civic',
    ano: 2021,
    placa: 'XYZ9W87',
    cor: 'Preto',
    quilometragem: 35000,
    chassi: '2HGFC2F59MH123456',
    renavam: '98765432109',
    categoria: 'Sedan',
    valorCompra: 88000,
    valorVenda: 102000,
    dataCompra: '2021-08-20',
    dataVenda: '2023-11-10',
    status: 'Vendido',
    imagens: [],
    observacoes: 'Vendido para cliente corporativo',
  },
  {
    id: '3',
    marca: 'Ford',
    modelo: 'Ranger',
    ano: 2023,
    placa: 'DEF5G67',
    cor: 'Branco',
    quilometragem: 15000,
    chassi: '8AFBR22L3J5123456',
    renavam: '55566677788',
    categoria: 'Picape',
    valorCompra: 185000,
    dataCompra: '2023-03-10',
    status: 'Manutenção',
    imagens: [],
    observacoes: 'Aguardando troca de peças',
  },
];

// Relatórios iniciais
export const relatoriosIniciais: Relatorio[] = [
  {
    id: '1',
    titulo: 'Problema no sistema de freios - Ford Ranger',
    descricao: 'O veículo apresentou ruídos anormais ao frear. Necessário verificação urgente dos discos e pastilhas.',
    categoria: 'Manutenção',
    prioridade: 'Alta',
    status: 'Em Análise',
    data: '2024-03-20',
    autorId: '4',
    autorNome: 'Ana Paula',
    carroId: '3',
    respostaDono: 'Já agendei a revisão para amanhã. Obrigado pelo aviso!',
    dataResposta: '2024-03-20',
  },
  {
    id: '2',
    titulo: 'Documentação do Corolla vencendo',
    descricao: 'O IPVA do Toyota Corolla vence no próximo mês. Solicito providências para regularização.',
    categoria: 'Documentação',
    prioridade: 'Média',
    status: 'Resolvido',
    data: '2024-03-15',
    autorId: '4',
    autorNome: 'Ana Paula',
    carroId: '1',
    respostaDono: 'Documentação já foi renovada. Tudo regularizado!',
    dataResposta: '2024-03-16',
  },
];

// Registros financeiros iniciais
export const registrosFinanceirosIniciais: RegistroFinanceiro[] = [
  {
    id: '1',
    tipo: 'Saída',
    categoria: 'Compra de Veículo',
    descricao: 'Compra Toyota Corolla 2022',
    valor: 95000,
    data: '2022-01-15',
    carroId: '1',
    responsavel: 'João Silva',
  },
  {
    id: '2',
    tipo: 'Saída',
    categoria: 'Compra de Veículo',
    descricao: 'Compra Honda Civic 2021',
    valor: 88000,
    data: '2021-08-20',
    carroId: '2',
    responsavel: 'João Silva',
  },
  {
    id: '3',
    tipo: 'Entrada',
    categoria: 'Venda de Veículo',
    descricao: 'Venda Honda Civic 2021',
    valor: 102000,
    data: '2023-11-10',
    carroId: '2',
    responsavel: 'Carlos Oliveira',
  },
  {
    id: '4',
    tipo: 'Saída',
    categoria: 'Compra de Veículo',
    descricao: 'Compra Ford Ranger 2023',
    valor: 185000,
    data: '2023-03-10',
    carroId: '3',
    responsavel: 'João Silva',
  },
  {
    id: '5',
    tipo: 'Saída',
    categoria: 'Manutenção',
    descricao: 'Manutenção preventiva Ford Ranger',
    valor: 2500,
    data: '2024-01-15',
    carroId: '3',
    responsavel: 'Carlos Oliveira',
  },
  {
    id: '6',
    tipo: 'Saída',
    categoria: 'Folha de Pagamento',
    descricao: 'Salários - Janeiro 2024',
    valor: 32000,
    data: '2024-01-05',
    responsavel: 'Maria Santos',
  },
  {
    id: '7',
    tipo: 'Saída',
    categoria: 'Folha de Pagamento',
    descricao: 'Salários - Fevereiro 2024',
    valor: 32000,
    data: '2024-02-05',
    responsavel: 'Maria Santos',
  },
  {
    id: '8',
    tipo: 'Saída',
    categoria: 'Despesas Operacionais',
    descricao: 'Aluguel e contas',
    valor: 8000,
    data: '2024-01-10',
    responsavel: 'Maria Santos',
  },
];

// Funções auxiliares para localStorage
export const initializeLocalStorage = () => {
  if (!localStorage.getItem('usuarios')) {
    localStorage.setItem('usuarios', JSON.stringify(usuariosIniciais));
  }
  if (!localStorage.getItem('carros')) {
    localStorage.setItem('carros', JSON.stringify(carrosIniciais));
  }
  if (!localStorage.getItem('registrosFinanceiros')) {
    localStorage.setItem('registrosFinanceiros', JSON.stringify(registrosFinanceirosIniciais));
  }
  if (!localStorage.getItem('relatorios')) {
    localStorage.setItem('relatorios', JSON.stringify(relatoriosIniciais));
  }
};

export const getUsuarios = (): Usuario[] => {
  const data = localStorage.getItem('usuarios');
  return data ? JSON.parse(data) : usuariosIniciais;
};

export const saveUsuarios = (usuarios: Usuario[]) => {
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
};

export const getCarros = (): Carro[] => {
  const data = localStorage.getItem('carros');
  return data ? JSON.parse(data) : carrosIniciais;
};

export const saveCarros = (carros: Carro[]) => {
  localStorage.setItem('carros', JSON.stringify(carros));
};

export const getRegistrosFinanceiros = (): RegistroFinanceiro[] => {
  const data = localStorage.getItem('registrosFinanceiros');
  return data ? JSON.parse(data) : registrosFinanceirosIniciais;
};

export const saveRegistrosFinanceiros = (registros: RegistroFinanceiro[]) => {
  localStorage.setItem('registrosFinanceiros', JSON.stringify(registros));
};

export const getRelatorios = (): Relatorio[] => {
  const data = localStorage.getItem('relatorios');
  return data ? JSON.parse(data) : relatoriosIniciais;
};

export const saveRelatorios = (relatorios: Relatorio[]) => {
  localStorage.setItem('relatorios', JSON.stringify(relatorios));
};