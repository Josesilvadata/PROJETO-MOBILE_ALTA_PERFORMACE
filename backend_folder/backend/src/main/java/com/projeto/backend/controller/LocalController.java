package com.projeto.backend.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.backend.dto.LocalDTO;

@RestController
@RequestMapping("/api/locais")
public class LocalController {

    private final JdbcTemplate jdbc;

    public LocalController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public List<LocalDTO> listar() {
        String sql = """
            SELECT l.id, l.nome, l.descricao,
                   ST_Y(l.localizacao) AS latitude,
                   ST_X(l.localizacao) AS longitude,
                   d.nome AS dimensao, n.nivel
            FROM locais l
            LEFT JOIN local_niveis_sensoriais n ON n.local_id = l.id
            LEFT JOIN dimensoes_sensoriais d ON d.id = n.dimensao_id
            ORDER BY l.id
            """;

        List<Map<String, Object>> linhas = jdbc.queryForList(sql);

        Map<Long, LocalDTO> locais = new LinkedHashMap<>();
        Map<Long, List<String>> tags = new LinkedHashMap<>();

        for (Map<String, Object> linha : linhas) {
            Long id = ((Number) linha.get("id")).longValue();
            List<String> listaTags = tags.computeIfAbsent(id, k -> new ArrayList<>());

            if (!locais.containsKey(id)) {
                double lat = ((Number) linha.get("latitude")).doubleValue();
                double lng = ((Number) linha.get("longitude")).doubleValue();
                locais.put(id, new LocalDTO(id, (String) linha.get("nome"),
                        (String) linha.get("descricao"), new double[] { lat, lng }, listaTags));
            }

            String tag = paraTag((String) linha.get("dimensao"), (String) linha.get("nivel"));
            if (tag != null) {
                listaTags.add(tag);
            }
        }
        return new ArrayList<>(locais.values());
    }

    private String paraTag(String dimensao, String nivel) {
        if (dimensao == null || !"baixo".equals(nivel)) {
            return null;
        }
        return switch (dimensao) {
            case "Ruído" -> "Baixo ruído";
            case "Iluminação" -> "Luz suave";
            case "Movimento de pessoas" -> "Sem multidão";
            default -> null;
        };
    }
}
