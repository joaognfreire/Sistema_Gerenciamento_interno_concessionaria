export type Cargo = 'Colaborador' | 'Gerente' | 'Gerente Financeiro' | 'Dono';

export interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  senha: string;
  cargo: Cargo;
  email: string;
  telefone: string;
  dataNascimento: string;
  dataAdmissao: string;
  salario?: number;
  ativo: boolean;
}

export interface Carro {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor: string;
  quilometragem: number;
  chassi: string;
  renavam: string;
  categoria: string;
  valorCompra: number;
  valorVenda?: number;
  dataCompra: string;
  dataVenda?: string;
  status: 'Disponível' | 'Vendido' | 'Manutenção';
  imagens: string[];
  observacoes?: string;
}

export interface Relatorio {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'Pendente' | 'Em Análise' | 'Resolvido' | 'Arquivado';
  data: string;
  autorId: string;
  autorNome: string;
  carroId?: string;
  anexos?: string[];
  respostaDono?: string;
  dataResposta?: string;
}

export interface RegistroFinanceiro {
  id: string;
  tipo: 'Entrada' | 'Saída';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  carroId?: string;
  responsavel: string;
}

export interface AuthContextType {
  usuario: Usuario | null;
  login: (cpf: string, senha: string) => Promise<boolean>;
  logout: () => void;
  temPermissao: (cargosPermitidos: Cargo[]) => boolean;
}