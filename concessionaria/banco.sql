CREATE DATABASE concessionaria;
USE concessionaria;

-- =====================================================
-- TABELA: CARGO
-- =====================================================

CREATE TABLE cargo (
    id_cargo INT AUTO_INCREMENT PRIMARY KEY,
    
    nome_cargo VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: PERMISSAO
-- =====================================================

CREATE TABLE permissao (
    id_permissao INT AUTO_INCREMENT PRIMARY KEY,
    
    id_cargo INT NOT NULL,
    
    modulo VARCHAR(50) NOT NULL,
    
    pode_visualizar BOOLEAN DEFAULT FALSE,
    pode_criar BOOLEAN DEFAULT FALSE,
    pode_editar BOOLEAN DEFAULT FALSE,
    pode_excluir BOOLEAN DEFAULT FALSE,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_permissao_cargo
        FOREIGN KEY (id_cargo)
        REFERENCES cargo(id_cargo)
        ON DELETE CASCADE
);

-- =====================================================
-- TABELA: COLABORADOR
-- =====================================================

CREATE TABLE colaborador (
    id_colaborador INT AUTO_INCREMENT PRIMARY KEY,
    
    id_cargo INT NOT NULL,
    
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    senha VARCHAR(255) NOT NULL,
    
    data_nascimento DATE,
    data_admissao DATE,
    
    salario DECIMAL(10,2),
    
    status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_colaborador_cargo
        FOREIGN KEY (id_cargo)
        REFERENCES cargo(id_cargo)
);

-- =====================================================
-- TABELA: VEICULO
-- =====================================================

CREATE TABLE veiculo (
    id_veiculo INT AUTO_INCREMENT PRIMARY KEY,
    
    id_colaborador INT NOT NULL,
    
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    
    ano_fabricacao YEAR NOT NULL,
    ano_modelo YEAR NOT NULL,
    
    placa VARCHAR(10) NOT NULL UNIQUE,
    cor VARCHAR(30),
    categoria VARCHAR(50),
    
    chassi VARCHAR(50) NOT NULL UNIQUE,
    renavam VARCHAR(50) NOT NULL UNIQUE,
    
    quilometragem INT,
    
    motor VARCHAR(50),
    garantia VARCHAR(50),
    
    valor_venda DECIMAL(12,2) NOT NULL,
    
    status ENUM(
        'Disponivel',
        'Vendido',
        'Manutencao'
    ) DEFAULT 'Disponivel',
    
    observacoes TEXT,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_veiculo_colaborador
        FOREIGN KEY (id_colaborador)
        REFERENCES colaborador(id_colaborador)
);

-- =====================================================
-- TABELA: IMAGEM_VEICULO
-- =====================================================

CREATE TABLE imagem_veiculo (
    id_imagem INT AUTO_INCREMENT PRIMARY KEY,
    
    id_veiculo INT NOT NULL,
    
    url_imagem TEXT NOT NULL,
    
    imagem_principal BOOLEAN DEFAULT FALSE,
    
    ordem INT DEFAULT 1,
    
    data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_imagem_veiculo
        FOREIGN KEY (id_veiculo)
        REFERENCES veiculo(id_veiculo)
        ON DELETE CASCADE
);

-- =====================================================
-- TABELA: VENDA
-- =====================================================

CREATE TABLE venda (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    
    id_veiculo INT NOT NULL UNIQUE,
    id_colaborador INT NOT NULL,
    
    nome_cliente VARCHAR(100) NOT NULL,
    cpf_cliente VARCHAR(14),
    telefone_cliente VARCHAR(20),
    email_cliente VARCHAR(100),
    
    valor_venda DECIMAL(12,2) NOT NULL,
    
    forma_pagamento VARCHAR(50),
    
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    status_venda ENUM(
        'Pendente',
        'Concluida',
        'Cancelada'
    ) DEFAULT 'Pendente',
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_venda_veiculo
        FOREIGN KEY (id_veiculo)
        REFERENCES veiculo(id_veiculo),

    CONSTRAINT fk_venda_colaborador
        FOREIGN KEY (id_colaborador)
        REFERENCES colaborador(id_colaborador)
);

-- =====================================================
-- TABELA: FINANCEIRO
-- =====================================================

CREATE TABLE financeiro (
    id_financeiro INT AUTO_INCREMENT PRIMARY KEY,
    
    id_colaborador INT NOT NULL,
    
    id_veiculo INT NULL,
    
    tipo ENUM(
        'Entrada',
        'Saida'
    ) NOT NULL,
    
    categoria VARCHAR(100) NOT NULL,
    
    descricao TEXT,
    
    valor DECIMAL(12,2) NOT NULL,
    
    data_movimento DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_financeiro_colaborador
        FOREIGN KEY (id_colaborador)
        REFERENCES colaborador(id_colaborador),

    CONSTRAINT fk_financeiro_veiculo
        FOREIGN KEY (id_veiculo)
        REFERENCES veiculo(id_veiculo)
);

-- =====================================================
-- TABELA: RELATORIO
-- =====================================================

CREATE TABLE relatorio (
    id_relatorio INT AUTO_INCREMENT PRIMARY KEY,
    
    id_veiculo INT NULL,
    id_colaborador INT NOT NULL,
    
    titulo VARCHAR(150) NOT NULL,
    
    descricao TEXT NOT NULL,
    
    categoria VARCHAR(50),
    
    prioridade ENUM(
        'Baixa',
        'Media',
        'Alta'
    ) DEFAULT 'Media',
    
    status ENUM(
        'Pendente',
        'Em Analise',
        'Resolvido'
    ) DEFAULT 'Pendente',
    
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_relatorio_veiculo
        FOREIGN KEY (id_veiculo)
        REFERENCES veiculo(id_veiculo),

    CONSTRAINT fk_relatorio_colaborador
        FOREIGN KEY (id_colaborador)
        REFERENCES colaborador(id_colaborador)
);

-- =====================================================
-- TABELA: RESPOSTA_RELATORIO
-- =====================================================

CREATE TABLE resposta_relatorio (
    id_resposta INT AUTO_INCREMENT PRIMARY KEY,
    
    id_relatorio INT NOT NULL,
    id_colaborador INT NOT NULL,
    
    mensagem TEXT NOT NULL,
    
    data_resposta DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_resposta_relatorio
        FOREIGN KEY (id_relatorio)
        REFERENCES relatorio(id_relatorio)
        ON DELETE CASCADE,

    CONSTRAINT fk_resposta_colaborador
        FOREIGN KEY (id_colaborador)
        REFERENCES colaborador(id_colaborador)
);