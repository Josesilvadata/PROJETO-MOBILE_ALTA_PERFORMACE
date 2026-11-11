
INSERT INTO dimensoes_sensoriais (nome, descricao)
VALUES
    ('Ruído', 'Nível de ruído percebido no local'),
    ('Iluminação', 'Nível de intensidade da iluminação'),
    ('Movimento de pessoas', 'Intensidade do movimento de pessoas')
ON CONFLICT (nome) DO NOTHING;
