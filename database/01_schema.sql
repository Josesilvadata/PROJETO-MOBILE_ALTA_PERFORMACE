CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dimensoes_sensoriais (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS usuario_sensibilidades (
    usuario_id BIGINT NOT NULL
        REFERENCES usuarios(id) ON DELETE CASCADE,
    dimensao_id BIGINT NOT NULL
        REFERENCES dimensoes_sensoriais(id) ON DELETE RESTRICT,
    PRIMARY KEY (usuario_id, dimensao_id)
);

CREATE TABLE IF NOT EXISTS locais (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    localizacao geometry(Point, 4326) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locais_localizacao
    ON locais USING GIST (localizacao);

CREATE TABLE IF NOT EXISTS local_niveis_sensoriais (
    local_id BIGINT NOT NULL
        REFERENCES locais(id) ON DELETE CASCADE,
    dimensao_id BIGINT NOT NULL
        REFERENCES dimensoes_sensoriais(id) ON DELETE RESTRICT,
    nivel VARCHAR(10) NOT NULL
        CHECK (nivel IN ('baixo', 'medio', 'alto')),
    PRIMARY KEY (local_id, dimensao_id)
);

CREATE TABLE IF NOT EXISTS favoritos (
    usuario_id BIGINT NOT NULL
        REFERENCES usuarios(id) ON DELETE CASCADE,
    local_id BIGINT NOT NULL
        REFERENCES locais(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, local_id)
);