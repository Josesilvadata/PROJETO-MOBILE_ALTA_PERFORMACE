BEGIN;

INSERT INTO public.dimensoes_sensoriais (nome, descricao)
VALUES
    ('Ruído', 'Nível de ruído percebido no local'),
    ('Iluminação', 'Nível de intensidade da iluminação'),
    ('Movimento de pessoas', 'Intensidade do movimento de pessoas')
ON CONFLICT (nome) DO NOTHING;

WITH avaliacoes_demo AS (
    SELECT
        l.id AS local_id,
        d.id AS dimensao_id,
        CASE ((l.id + d.id) % 3)
            WHEN 0 THEN 'baixo'
            WHEN 1 THEN 'medio'
            ELSE 'alto'
        END AS nivel
    FROM public.locais AS l
    CROSS JOIN public.dimensoes_sensoriais AS d
    WHERE d.nome IN ('Ruído', 'Iluminação', 'Movimento de pessoas')
)
INSERT INTO public.local_niveis_sensoriais (local_id, dimensao_id, nivel)
SELECT local_id, dimensao_id, nivel
FROM avaliacoes_demo
ON CONFLICT (local_id, dimensao_id) DO NOTHING;

COMMIT;

SELECT
    COUNT(*) AS total_locais,
    COUNT(*) FILTER (WHERE avaliacoes = 3) AS locais_completos,
    COUNT(*) FILTER (WHERE avaliacoes < 3) AS locais_incompletos,
    SUM(avaliacoes) AS total_avaliacoes
FROM (
    SELECT
        l.id,
        COUNT(ln.dimensao_id) AS avaliacoes
    FROM public.locais AS l
    LEFT JOIN public.local_niveis_sensoriais AS ln
        ON ln.local_id = l.id
    LEFT JOIN public.dimensoes_sensoriais AS d
        ON d.id = ln.dimensao_id
       AND d.nome IN ('Ruído', 'Iluminação', 'Movimento de pessoas')
    GROUP BY l.id
) AS resumo;

