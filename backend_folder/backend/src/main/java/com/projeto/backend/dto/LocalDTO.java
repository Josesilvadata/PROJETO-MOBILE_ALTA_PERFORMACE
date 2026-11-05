package com.projeto.backend.dto;

import java.util.List;

public record LocalDTO(Long id, String nome, String descricao, double[] pos, List<String> tags) {}