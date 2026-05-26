CREATE DATABASE IF NOT EXISTS concessionaria;
USE concessionaria;

-- =====================================================
-- TABELA: CARGO
-- =====================================================

CREATE TABLE IF NOT EXISTS cargo (
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

CREATE TABLE IF NOT EXISTS permissao (
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

CREATE TABLE IF NOT EXISTS colaborador (
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

CREATE TABLE IF NOT EXISTS veiculo (
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
    
    valor_compra DECIMAL(12,2),
    valor_venda DECIMAL(12,2),
    data_compra DATE,
    data_venda DATE,
    
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

CREATE TABLE IF NOT EXISTS imagem_veiculo (
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

CREATE TABLE IF NOT EXISTS venda (
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
        REFERENCES veiculo(id_veiculo)
        ON DELETE CASCADE,

    CONSTRAINT fk_venda_colaborador
        FOREIGN KEY (id_colaborador)
        REFERENCES colaborador(id_colaborador)
);

-- =====================================================
-- TABELA: FINANCEIRO
-- =====================================================

CREATE TABLE IF NOT EXISTS financeiro (
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
    apagado BOOLEAN NOT NULL DEFAULT FALSE,
    apagado_em DATETIME NULL,
    apagado_por_id INT NULL,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_financeiro_colaborador
        FOREIGN KEY (id_colaborador)
        REFERENCES colaborador(id_colaborador),

    CONSTRAINT fk_financeiro_veiculo
        FOREIGN KEY (id_veiculo)
        REFERENCES veiculo(id_veiculo)
        ON DELETE SET NULL
);

-- =====================================================
-- TABELA: RELATORIO
-- =====================================================

CREATE TABLE IF NOT EXISTS relatorio (
    id_relatorio INT AUTO_INCREMENT PRIMARY KEY,
    
    id_veiculo INT NULL,
    id_colaborador INT NOT NULL,
    
    titulo VARCHAR(150) NOT NULL,
    
    descricao TEXT NOT NULL,
    
    categoria VARCHAR(50),
    
    prioridade ENUM(
        'Baixa',
        'Media',
        'Alta',
        'Urgente'
    ) DEFAULT 'Media',
    
    status ENUM(
        'Pendente',
        'Em Analise',
        'Resolvido',
        'Arquivado'
    ) DEFAULT 'Pendente',
    
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    apagado BOOLEAN NOT NULL DEFAULT FALSE,
    apagado_em DATETIME NULL,
    apagado_por_id INT NULL,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_relatorio_veiculo
        FOREIGN KEY (id_veiculo)
        REFERENCES veiculo(id_veiculo)
        ON DELETE SET NULL,

    CONSTRAINT fk_relatorio_colaborador
        FOREIGN KEY (id_colaborador)
        REFERENCES colaborador(id_colaborador)
);

-- =====================================================
-- TABELA: RESPOSTA_RELATORIO
-- =====================================================

CREATE TABLE IF NOT EXISTS resposta_relatorio (
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

-- =====================================================
-- MIGRACOES PARA BANCOS JA CRIADOS
-- =====================================================

ALTER TABLE veiculo MODIFY valor_venda DECIMAL(12,2) NULL;
ALTER TABLE relatorio MODIFY prioridade ENUM('Baixa', 'Media', 'Alta', 'Urgente') DEFAULT 'Media';
ALTER TABLE relatorio MODIFY status ENUM('Pendente', 'Em Analise', 'Resolvido', 'Arquivado') DEFAULT 'Pendente';

DROP PROCEDURE IF EXISTS add_column_if_missing;

DELIMITER //
CREATE PROCEDURE add_column_if_missing(
    IN table_name_value VARCHAR(64),
    IN column_name_value VARCHAR(64),
    IN column_definition_value TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = table_name_value
          AND column_name = column_name_value
    ) THEN
        SET @ddl = CONCAT(
            'ALTER TABLE `', table_name_value, '` ADD COLUMN `',
            column_name_value, '` ', column_definition_value
        );
        PREPARE statement_to_run FROM @ddl;
        EXECUTE statement_to_run;
        DEALLOCATE PREPARE statement_to_run;
    END IF;
END//
DELIMITER ;

CALL add_column_if_missing('veiculo', 'valor_compra', 'DECIMAL(12,2) NULL AFTER garantia');
CALL add_column_if_missing('veiculo', 'data_compra', 'DATE NULL AFTER valor_venda');
CALL add_column_if_missing('veiculo', 'data_venda', 'DATE NULL AFTER data_compra');
CALL add_column_if_missing('financeiro', 'apagado', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER data_movimento');
CALL add_column_if_missing('financeiro', 'apagado_em', 'DATETIME NULL AFTER apagado');
CALL add_column_if_missing('financeiro', 'apagado_por_id', 'INT NULL AFTER apagado_em');
CALL add_column_if_missing('financeiro', 'criado_em', 'DATETIME DEFAULT CURRENT_TIMESTAMP AFTER apagado_por_id');
CALL add_column_if_missing('financeiro', 'atualizado_em', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER criado_em');
CALL add_column_if_missing('relatorio', 'apagado', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER data_criacao');
CALL add_column_if_missing('relatorio', 'apagado_em', 'DATETIME NULL AFTER apagado');
CALL add_column_if_missing('relatorio', 'apagado_por_id', 'INT NULL AFTER apagado_em');
CALL add_column_if_missing('relatorio', 'criado_em', 'DATETIME DEFAULT CURRENT_TIMESTAMP AFTER apagado_por_id');
CALL add_column_if_missing('relatorio', 'atualizado_em', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER criado_em');

DROP PROCEDURE add_column_if_missing;
