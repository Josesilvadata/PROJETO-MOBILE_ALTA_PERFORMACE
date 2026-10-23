# Projeto Mobile Alta Performance

Aplicação mobile com **front-end em React** e **back-end em Spring Boot**, integrada a um banco de dados **PostgreSQL com PostGIS**. O projeto organiza **locais** com seus **níveis sensoriais** (ruído, iluminação e movimento de pessoas) e permite que cada usuário tenha conta, defina suas sensibilidades e salve locais favoritos.

> Status: em desenvolvimento. O módulo de **cadastro e login de usuários** do back-end já está funcionando.

---

## Sumário

- [Tecnologias](#tecnologias)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Banco de dados](#banco-de-dados)
- [Como rodar o back-end](#como-rodar-o-back-end)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do back-end](#estrutura-do-back-end)
- [Segurança](#segurança)
- [Próximos passos](#próximos-passos)
- [Equipe](#equipe)

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | React |
| Back-end | Java 17+ (testado com Java 21), Spring Boot 4.1.1, Spring Web MVC, Spring Data JPA |
| Segurança | Spring Security (configuração liberada) e BCrypt para senhas |
| Banco de dados | PostgreSQL 17 com extensão PostGIS |
| Build | Maven (Maven Wrapper incluso) |

---

## Estrutura do repositório

```
PROJETO-MOBILE_ALTA_PERFORMACE/
├── backend_folder/
│   └── backend/          # API em Spring Boot
├── database/             # Scripts SQL (tabelas, dados iniciais e consultas de verificação)
└── README.md
```

---

## Banco de dados

Os scripts ficam na pasta `database/`. O modelo tem 6 tabelas:

| Tabela | Descrição |
|---|---|
| `usuarios` | Contas dos usuários (nome, e-mail único e `senha_hash`) |
| `dimensoes_sensoriais` | Tipos de estímulo avaliados: Ruído, Iluminação, Movimento de pessoas |
| `usuario_sensibilidades` | Quais dimensões cada usuário marcou como sensíveis |
| `locais` | Locais cadastrados, com coordenadas geográficas (`geometry(Point, 4326)`) |
| `local_niveis_sensoriais` | Nível de cada dimensão em cada local: `baixo`, `medio` ou `alto` |
| `favoritos` | Locais salvos por cada usuário |

---

## Como rodar o back-end

### Pré-requisitos

- Java 17 ou superior
- PostgreSQL 17
- PostGIS instalado (necessário para a tabela `locais`; o cadastro e o login funcionam mesmo sem ele)
- VS Code, IntelliJ ou outra IDE de sua preferência

### 1. Criar o banco

No pgAdmin (ou no `psql`), crie um banco chamado `projeto_db` e execute nele os scripts da pasta `database/`, na ordem: criação das tabelas e depois os dados iniciais.

Para conferir:

```sql
SELECT id, nome, email FROM usuarios;
```

### 2. Configurar as credenciais

A senha do banco **não deve ficar escrita no código**. O `application.properties` lê os dados de variáveis de ambiente:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
```

**Opção A: variáveis de ambiente (PowerShell)**

```powershell
cd backend_folder\backend

$env:DB_URL="jdbc:postgresql://localhost:5432/projeto_db"
$env:DB_USER="postgres"
$env:DB_PASSWORD="SUA_SENHA"

.\mvnw spring-boot:run
```

**Opção B: perfil local**

Crie o arquivo `backend_folder/backend/src/main/resources/application-local.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/projeto_db
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA
```

Esse arquivo **não pode ir para o Git**. Confirme que o `.gitignore` contém:

```
backend_folder/backend/src/main/resources/application-local.properties
```

Depois rode:

```powershell
cd backend_folder\backend
.\mvnw spring-boot:run "-Dspring-boot.run.profiles=local"
```

### 3. Confirmar que subiu

No fim do log deve aparecer:

```
Started BackendApplication in X seconds
```

A API fica disponível em `http://localhost:8080`.

---

## Endpoints da API

Base URL: `http://localhost:8080/api`

### `POST /api/cadastro`

Cria um novo usuário.

**Corpo da requisição**

```json
{
  "nome": "Maria",
  "email": "maria@email.com",
  "senha": "123456"
}
```

**Respostas**

| Código | Significado |
|---|---|
| `201` | Usuário cadastrado com sucesso |
| `400` | Nome, e-mail ou senha não preenchidos |
| `409` | E-mail já cadastrado |

### `POST /api/login`

Autentica um usuário.

**Corpo da requisição**

```json
{
  "email": "maria@email.com",
  "senha": "123456"
}
```

**Resposta de sucesso (`200`)**

```json
{
  "mensagem": "Login realizado com sucesso",
  "id": 1,
  "nome": "Maria"
}
```

**Respostas de erro**

| Código | Significado |
|---|---|
| `401` | E-mail ou senha inválidos |

### Testando pelo PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/cadastro" -Method Post -ContentType "application/json" -Body '{"nome":"Maria","email":"maria@email.com","senha":"123456"}'

Invoke-RestMethod -Uri "http://localhost:8080/api/login" -Method Post -ContentType "application/json" -Body '{"email":"maria@email.com","senha":"123456"}'
```

> Observação: o PowerShell do Windows pode enviar caracteres acentuados em outra codificação e causar erro `400`. Para testes, use nomes sem acento ou use o Postman. O front-end em React envia em UTF-8 e não tem esse problema.

---

## Estrutura do back-end

```
backend_folder/backend/src/main/java/com/projeto/backend/
├── BackendApplication.java
├── config/
│   └── SecurityConfig.java        # Configuração do Spring Security (CSRF, CORS e rotas)
├── controller/
│   └── ClienteController.java     # Endpoints de cadastro e login
├── dto/
│   └── AuthRequest.java           # Dados recebidos nas requisições
├── model/
│   └── Cliente.java               # Entidade mapeada para a tabela `usuarios`
└── repository/
    └── ClienteRepository.java     # Acesso ao banco com Spring Data JPA
```

---

## Segurança

- As senhas são salvas como hash **BCrypt** na coluna `senha_hash`. Nunca ficam em texto puro.
- As credenciais do banco ficam em variáveis de ambiente ou em um arquivo local ignorado pelo Git.
- O `ddl-auto=none` impede o Spring de alterar as tabelas do banco automaticamente.
- Neste momento a API **não emite token de sessão (JWT)**. O login apenas valida as credenciais e devolve os dados do usuário.

---

## Próximos passos

- [ ] Integrar as telas de cadastro e login do React aos endpoints
- [ ] Implementar autenticação com token (JWT)
- [ ] Endpoints de locais e níveis sensoriais
- [ ] Endpoints de sensibilidades do usuário e favoritos
- [ ] Busca de locais por proximidade usando PostGIS
- [ ] Configurar o banco com Docker (imagem com PostGIS) para todo o grupo
- [ ] Testes automatizados

---

## Equipe

| Luiza | Banco de dados |
| Jorge | Banco de dados|
| José  | Back-end |
| Cauã  | Back-end |
| Igor  | Front-end|
| Guilherme  | Front-end|
---
