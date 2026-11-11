BEGIN;

INSERT INTO public.dimensoes_sensoriais (nome, descricao)
VALUES
    ('Ruído', 'Nível de ruído percebido no local'),
    ('Iluminação', 'Nível de intensidade da iluminação'),
    ('Movimento de pessoas', 'Intensidade do movimento de pessoas')
ON CONFLICT (nome) DO NOTHING;


WITH primeiros_locais AS (
    SELECT id
    FROM public.locais
    ORDER BY id
    LIMIT 30
),
dimensoes AS (
    SELECT id
    FROM public.dimensoes_sensoriais
    WHERE nome IN ('Ruído', 'Iluminação', 'Movimento de pessoas')
),
avaliacoes_demo AS (
    SELECT
        l.id AS local_id,
        d.id AS dimensao_id,
        CASE ((l.id + d.id) % 3)
            WHEN 0 THEN 'baixo'
            WHEN 1 THEN 'medio'
            ELSE 'alto'
        END AS nivel
    FROM primeiros_locais l
    CROSS JOIN dimensoes d
)
INSERT INTO public.local_niveis_sensoriais (local_id, dimensao_id, nivel)
SELECT local_id, dimensao_id, nivel
FROM avaliacoes_demo
ON CONFLICT (local_id, dimensao_id) DO NOTHING;

COMMIT;

SELECT
    COUNT(*) AS total_avaliacoes_sensoriais,
    COUNT(DISTINCT local_id) AS locais_com_avaliacoes
FROM public.local_niveis_sensoriais
WHERE local_id IN (
    SELECT id
    FROM public.locais
    ORDER BY id
    LIMIT 30
);
