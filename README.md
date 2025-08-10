# BarberFlow API

API REST para o sistema BarberFlow, uma plataforma completa de agendamento para barbearias.

## 🎯 Descrição

BarberFlow é um SaaS que permite que barbeiros e donos de barbearias criem uma página de agendamento online personalizada. Os clientes acessam essa página através de um link exclusivo para visualizar os serviços, preços e horários disponíveis, e para agendar um atendimento. O sistema é multitenant, suportando múltiplas barbearias de forma isolada e segura.

## 🚀 Tecnologias

- TypeScript
- Node.js
- Koa.js
- Prisma ORM
- PostgreSQL
- Supabase (Autenticação)
- Stripe (Pagamentos)
- Jest (Testes)
- Docker

## 📋 Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 13
- Docker (opcional)
- Conta no Supabase
- Conta no Stripe (para processar pagamentos)

## 🛠️ Instalação

1. Clone o repositório:

```bash
git clone https://github.com/ssk4trio/cron-barber-api.git
cd cron-barber-api
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/barberflow"

# Supabase
SUPABASE_URL="sua-url-do-supabase"
SUPABASE_ANON_KEY="sua-chave-anonima-do-supabase"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-de-servico-do-supabase"

# Stripe
STRIPE_SECRET_KEY="sua-chave-secreta-do-stripe"
STRIPE_WEBHOOK_SECRET="seu-secret-do-webhook-do-stripe"

# Email
SMTP_HOST="smtp.exemplo.com"
SMTP_PORT=587
SMTP_USER="seu-usuario"
SMTP_PASS="sua-senha"
SMTP_FROM="noreply@exemplo.com"

# Frontend
FRONTEND_URL="http://localhost:5173"
```

4. Execute as migrações do banco de dados:

```bash
npm run prisma:migrate
```

5. Inicie o servidor em modo desenvolvimento:

```bash
npm run dev
```

## 🏗️ Estrutura do Projeto

O projeto segue os princípios de Clean Architecture e Domain-Driven Design:

```
src/
├── application/      # Casos de uso da aplicação
│   ├── auth/        # Autenticação
│   ├── appointment/ # Agendamentos
│   └── schedule/    # Gestão de horários
├── domain/          # Regras de negócio e entidades
│   ├── auth/        # Entidades de autenticação
│   ├── barbershop/  # Entidades da barbearia
│   ├── common/      # Value Objects comuns
│   └── payment/     # Serviços de pagamento
├── infrastructure/  # Implementações e serviços externos
│   ├── auth/        # Integração Supabase
│   ├── database/    # Repositórios Prisma
│   ├── payment/     # Integração Stripe
│   └── notifications/ # Serviços de notificação
├── presentation/    # Controllers e rotas HTTP
│   └── http/        # Endpoints da API
└── server/         # Configuração do servidor Koa
```

## 📚 Principais Funcionalidades

### Autenticação

- Registro de usuários
- Login com email/senha
- Verificação de email
- Recuperação de senha
- Autenticação via Supabase

### Barbearias

- Cadastro e gestão de barbearias
- Gerenciamento de serviços
- Configuração de horários
- Bloqueio de datas/horários

### Agendamentos

- Criação e gestão de agendamentos
- Cancelamento automático
- Notificações por email
- Disponibilidade inteligente

### Assinaturas

- Planos mensais/anuais
- Integração com Stripe
- Gestão de pagamentos
- Convites para equipe

## 📡 API Endpoints

### Autenticação

- `POST /auth/signup` - Registro de usuário
- `POST /auth/signin` - Login
- `POST /auth/signout` - Logout
- `GET /auth/confirm-email` - Confirmar email
- `POST /auth/verify/resend` - Reenviar verificação

### Barbearias

- `POST /barbershops` - Criar barbearia
- `GET /barbershops/:slug` - Detalhes da barbearia
- `PUT /barbershops/:id` - Atualizar dados
- `DELETE /barbershops/:id` - Remover barbearia

### Agendamentos

- `GET /barbershops/:slug/availability` - Verificar disponibilidade
- `POST /appointments` - Criar agendamento
- `GET /appointments/:id` - Detalhes do agendamento
- `DELETE /appointments/:id` - Cancelar agendamento

### Pagamentos

- `POST /subscriptions` - Criar assinatura
- `GET /subscriptions/:id` - Status da assinatura
- `POST /subscriptions/webhook` - Webhook Stripe

## 🧪 Testes

Execute os testes:

```bash
# Testes unitários
npm test

# Testes em modo watch
npm run test:watch
```

## 📦 Deploy

O projeto está configurado para deploy via Docker:

```bash
# Construir imagem
docker build -t barber-flow-api .

# Executar container
docker run -p 3000:3000 barber-flow-api
```

## 📄 Licença

Este projeto está sob a licença ISC.

## ✒️ Autores

- **SSK4Trio** - _Desenvolvimento_ - [Github](https://github.com/ssk4trio)
