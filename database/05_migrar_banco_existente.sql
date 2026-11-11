
-- Atualiza a tabela locais para suportar dados da Prefeitura e do OSM.

ALTER TABLE public.locais
    ADD COLUMN IF NOT EXISTS categoria VARCHAR(80);

ALTER TABLE public.locais
    ADD COLUMN IF NOT EXISTS origem VARCHAR(30)
    NOT NULL DEFAULT 'PREFEITURA_RECIFE';

ALTER TABLE public.locais
    ADD COLUMN IF NOT EXISTS osm_id BIGINT;

ALTER TABLE public.locais
    ADD COLUMN IF NOT EXISTS osm_tipo VARCHAR(15);

-- Garante os índices necessários.

CREATE INDEX IF NOT EXISTS idx_locais_localizacao
    ON public.locais USING GIST (localizacao);

CREATE UNIQUE INDEX IF NOT EXISTS idx_locais_osm_unico
    ON public.locais (osm_tipo, osm_id)
    WHERE osm_id IS NOT NULL;
