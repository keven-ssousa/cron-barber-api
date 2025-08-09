# BarberFlow API

API para o sistema BarberFlow de agendamento para barbearias.

## Descrição

BarberFlow é um SaaS que permite que barbeiros e donos de barbearias criem uma página de agendamento online personalizada. Os clientes acessam essa página através de um link exclusivo para visualizar os serviços, preços e horários disponíveis, e para agendar um atendimento. O sistema é multitenant, suportando múltiplas barbearias de forma isolada e segura.

## Requisitos

- Node.js v16+
- PostgreSQL v13+
- NPM ou Yarn

## Configuração

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd barber-flow-api
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/barberflow"
PORT=3000
WHATSAPP_API_KEY="seu-api-key"
WHATSAPP_API_URL="https://api.whatsapp.com/v1/messages"
```

4. Configure o banco de dados:

```bash
# Crie o banco de dados
psql -U postgres -c "CREATE DATABASE barberflow"

# Execute as migrações
npx prisma migrate dev
```

5. Execute o projeto em desenvolvimento:

```bash
npm run dev
```

## Estrutura do Projeto

O projeto segue os princípios de Clean Architecture e Domain-Driven Design:

- `/src/domain`: Contém as entidades, value objects e interfaces de repositório
- `/src/application`: Casos de uso e regras de aplicação
- `/src/infrastructure`: Implementações concretas (Prisma, gateways de notificação)
- `/src/presentation`: Controllers e rotas da API

## API Endpoints

### Endpoints Públicos

#### Listar Horários Disponíveis

```
GET /public/shops/:slug/availability?date=YYYY-MM-DD&serviceId=1
```

#### Criar Agendamento

```
POST /public/shops/:slug/appointments
{
  "serviceId": 1,
  "customerId": 1,
  "startTime": "2023-10-01T14:00:00Z",
  "endTime": "2023-10-01T14:30:00Z",
  "notes": "Observações opcionais"
}
```

#### Cancelar Agendamento

```
GET /public/shops/:slug/cancel/:token
```

## Licença

[MIT](LICENSE)
