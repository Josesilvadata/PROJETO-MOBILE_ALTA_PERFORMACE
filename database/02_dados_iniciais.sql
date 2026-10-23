INSERT INTO dimensoes_sensoriais (nome, descricao)
VALUES
    ('Ruído', 'Nível de ruído percebido no local'),
    ('Iluminação', 'Nível de intensidade da iluminação'),
    ('Movimento de pessoas', 'Intensidade do movimento de pessoas')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO locais (nome, descricao, localizacao)
SELECT
    dados.nome,
    dados.descricao,
    ST_SetSRID(ST_MakePoint(dados.longitude, dados.latitude), 4326)
FROM (
    VALUES
        (
            'Local demonstrativo A',
            'Local fictício para testes',
            -34.90::DOUBLE PRECISION,
            -8.05::DOUBLE PRECISION
        ),
        (
            'Local demonstrativo B',
            'Segundo local fictício para testes',
            -34.91::DOUBLE PRECISION,
            -8.06::DOUBLE PRECISION
        )
) AS dados(nome, descricao, longitude, latitude)
WHERE NOT EXISTS (
    SELECT 1
    FROM locais l
    WHERE l.nome = dados.nome
);

INSERT INTO local_niveis_sensoriais (local_id, dimensao_id, nivel)
SELECT l.id, d.id, dados.nivel
FROM (
    VALUES
        ('Local demonstrativo A', 'Ruído', 'baixo'),
        ('Local demonstrativo A', 'Iluminação', 'medio'),
        ('Local demonstrativo A', 'Movimento de pessoas', 'baixo'),
        ('Local demonstrativo B', 'Ruído', 'alto'),
        ('Local demonstrativo B', 'Iluminação', 'alto'),
        ('Local demonstrativo B', 'Movimento de pessoas', 'medio')
) AS dados(local_nome, dimensao_nome, nivel)
JOIN locais l ON l.nome = dados.local_nome
JOIN dimensoes_sensoriais d ON d.nome = dados.dimensao_nome
ON CONFLICT (local_id, dimensao_id) DO NOTHING;
