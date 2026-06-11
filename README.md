# Task Manager

Sistema de gerenciamento de tarefas com API RESTful em ASP.NET Core e frontend em React.

## Sobre o projeto

Aplicação full-stack para criação, listagem, edição e remoção de tarefas com suporte a paginação, filtro por status e idempotência em operações de escrita.

**Decisões de arquitetura:**
- **Clean Architecture** com separação em camadas: Domain, Application, Infrastructure e API.
- **Mapeamento manual** entre entidades e DTOs, sem AutoMapper, para maior controle e rastreabilidade.
- **Middleware de idempotência** garante que requisições `POST`/`PUT` com a mesma `Idempotency-Key` retornem sempre a mesma resposta (chave válida por 24h).
- **Middleware global de erros** traduz exceções de domínio (`ArgumentException`, `KeyNotFoundException`) para respostas HTTP padronizadas.
- **Status armazenado como string** no banco de dados para legibilidade nos dados persistidos.

## Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server (local ou via Docker)
- Node.js 18+

## Configuração do banco de dados

Ajuste a connection string em `TaskManager.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=TaskManagerDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Execute as migrations para criar o banco:

## Executando o Update

```bash
dotnet ef database update --project TaskManager.Infrastructure --startup-project TaskManager.API
```

## Rodando a API

```bash
dotnet run --project TaskManager.API --urls "http://localhost:5000"
```

## Rodando os testes

```bash
dotnet test
```

## Rodando o frontend

```bash
cd task-manager-web
npm install
npm run dev
```

## Swagger

Após iniciar a API, acesse a documentação interativa em:

```
https://localhost:{porta}/swagger
```

## Funcionalidades implementadas

### Backend (API)
- **CRUD completo** de tarefas via API REST
- **Paginação** com parâmetros `page` e `pageSize`
- **Filtro por status** (`Pending`, `InProgress`, `Completed`)
- **Filtros avançados**: por título, descrição, intervalo de data de criação e intervalo de data de conclusão
- **Ordenação** por título, status, data de criação ou data de conclusão (ascendente/descendente)
- **Atualização rápida de status** via endpoint `PATCH /api/tasks/{id}/status`
- **Soft delete**: tarefas excluídas vão para uma lixeira (`DELETE /api/tasks/{id}/soft`), podem ser restauradas (`PATCH /api/tasks/{id}/restore`) ou removidas permanentemente (`DELETE /api/tasks/{id}`)
- **DTOs por contexto**: `TaskSummaryDto` na listagem e `TaskDetailDto` no detalhe/criação/edição
- **Cache em memória** nas consultas de listagem e detalhe, com invalidação automática por token a cada escrita
- **Idempotência** em `POST` e `PUT` via header `Idempotency-Key` (UUID), com expiração em 24h
- **Middleware global de erros** com respostas padronizadas em JSON
- **Validações de domínio**: título obrigatório (máx. 100 chars), `CompletedAt` não pode ser anterior a `CreatedAt`
- **18 testes unitários** cobrindo criação, atualização, alteração de status, exclusão (lógica e permanente) e restauração (cenários de sucesso e falha)

### Frontend (React)
- **Listagem paginada** de tarefas, com opção de exibir todas de uma vez
- **Formulário de criação/edição** com data mínima de conclusão bloqueada para hoje (não permite datas passadas)
- **Alteração de status diretamente na listagem** via popup de seleção rápida
- **Filtros combinados**: por status (atalhos rápidos) e filtros avançados (título, descrição, datas de criação/conclusão)
- **Ordenação por coluna** (título, status, criação, conclusão) com indicação visual de direção
- **Lixeira de tarefas**: visualização de itens excluídos, restauração e exclusão permanente
- **Indicador visual de tarefa expirada** (prazo de conclusão vencido sem status "Concluída")
- **Tema claro/escuro** com alternância via botão no cabeçalho
- **Confirmação de exclusão** com opção de mover para lixeira ou excluir permanentemente
