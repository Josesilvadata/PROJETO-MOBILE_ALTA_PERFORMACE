SELECT
    current_database() AS banco_atual,
    PostGIS_Full_Version() AS versao_postgis;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'usuarios',
      'dimensoes_sensoriais',
      'usuario_sensibilidades',
      'locais',
      'local_niveis_sensoriais',
      'favoritos'
  )
ORDER BY table_name;

SELECT id, nome, descricao
FROM dimensoes_sensoriais
ORDER BY id;

SELECT
    l.id AS local_id,
    l.nome AS local,
    ST_AsText(l.localizacao) AS coordenadas,
    d.nome AS dimensao_sensorial,
    n.nivel
FROM locais l
LEFT JOIN local_niveis_sensoriais n
    ON n.local_id = l.id
LEFT JOIN dimensoes_sensoriais d
    ON d.id = n.dimensao_id
ORDER BY l.id, d.id;
