package com.projeto.backend.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.backend.dto.AuthRequest;
import com.projeto.backend.model.Cliente;
import com.projeto.backend.repository.ClienteRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // libera o front-end React em desenvolvimento
public class ClienteController {

    private final ClienteRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public ClienteController(ClienteRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody AuthRequest req) {
        if (req.nome() == null || req.email() == null || req.senha() == null
                || req.nome().isBlank() || req.email().isBlank() || req.senha().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Preencha nome, email e senha"));
        }

        if (repository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("erro", "Email já cadastrado"));
        }

        Cliente cliente = new Cliente();
        cliente.setNome(req.nome());
        cliente.setEmail(req.email());
        cliente.setSenha(encoder.encode(req.senha()));
        repository.save(cliente);

        return ResponseEntity.status(201).body(Map.of("mensagem", "Cliente cadastrado com sucesso"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        Optional<Cliente> cliente = repository.findByEmail(req.email());

        if (cliente.isEmpty() || !encoder.matches(req.senha(), cliente.get().getSenha())) {
            return ResponseEntity.status(401).body(Map.of("erro", "Email ou senha inválidos"));
        }

        return ResponseEntity.ok(Map.of(
                "mensagem", "Login realizado com sucesso",
                "id", cliente.get().getId(),
                "nome", cliente.get().getNome()
        ));
    }
}
