# 🏖️ Villa Daniella Beach Homes

> Sistema web full-stack de gerenciamento de casas de temporada para uma pousada frente-mar em Florianópolis. Reservas online, pagamento integrado e painel administrativo em um só lugar.

[![Next.js](https://img.shields.io/badge/Next.js-13-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sanity](https://img.shields.io/badge/Sanity-CMS-F03E2F?logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

🔗 **Demo:** [villa-daniella.vercel.app](https://villa-daniella.vercel.app)

---

## 📌 Sobre o projeto

A Villa Daniella é uma pousada frente-mar que controlava reservas e hóspedes em planilhas e plataformas externas, sem integração — o que gerava duplicidade de reservas, dados fragmentados e dependência de comissões de terceiros.

Este sistema resolve essa dor com uma **plataforma própria, responsiva e escalável**, que centraliza reservas, pagamentos e gestão, devolvendo ao negócio o controle total sobre suas operações e sobre a experiência do hóspede.

> 💬 *"…a base apresentada já está sólida, funcional e alinhada com necessidades reais do mercado."*
> — Diogo Rangel, Villa Daniella (cliente)

---

## ✨ Funcionalidades

- **Catálogo e busca** — listagem de acomodações com filtro dinâmico por tipo, camas e hóspedes
- **Página de detalhes** — galeria de fotos, descrição completa e informações da acomodação
- **Reservas com datas** — check-in/check-out com cálculo automático do valor e bloqueio de datas ocupadas
- **Pagamento online** — cobrança integrada e segura via Stripe, com confirmação automática
- **Autenticação** — login com Google (OAuth) ou e-mail e senha, com sessões seguras
- **Painel administrativo** — gestão completa de acomodações, reservas, usuários e conteúdo

---

## 🏗️ Arquitetura

Arquitetura **headless e desacoplada**: o frontend é independente do backend de dados, e cada serviço tem uma responsabilidade clara.

```
Usuário (HTTPS)
      │
      ▼
Vercel CDN ──► Next.js App ──► API Routes ──► Serviços integrados
 (edge global)  (SSR/SSG/CSR)  (regras de       ├─ Sanity CMS  (conteúdo das acomodações)
                                negócio)         ├─ NextAuth    (sessões e login)
                                                 └─ Stripe      (pagamentos e webhooks)
```

---

## 🛠️ Tecnologias

| Tecnologia | Função |
|------------|--------|
| **Next.js 13** | Framework React com renderização híbrida (SSR/SSG/CSR) e API Routes |
| **TypeScript** | Tipagem estática para mais segurança e manutenção |
| **Sanity CMS** | Gerenciamento de conteúdo headless das acomodações |
| **NextAuth.js + bcrypt** | Autenticação via Google OAuth e e-mail/senha com hash de senhas |
| **Stripe** | Processamento de pagamentos (certificação PCI DSS) e webhooks |
| **Vercel** | Deploy contínuo, CDN global e escalabilidade automática |
| **Git + GitHub** | Versionamento e colaboração |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+ e npm
- Contas em: [Sanity](https://www.sanity.io/), [Stripe](https://stripe.com/) (modo teste) e [Google Cloud Console](https://console.cloud.google.com/) (OAuth)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/micheldavibusquet/villa-daniella.git
cd villa-daniella

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# Crie um arquivo .env.local na raiz (veja a seção abaixo)

# 4. Rode em modo de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=seu_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=seu_token

# NextAuth
NEXTAUTH_SECRET=sua_string_aleatoria
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> ⚠️ **Nunca** comite o arquivo `.env.local`. Confirme que ele está listado no `.gitignore`.

> 💡 Para testar webhooks do Stripe localmente, use a [Stripe CLI](https://stripe.com/docs/stripe-cli):
> ```bash
> stripe listen --forward-to localhost:3000/api/webhooks/stripe
> ```
> O `whsec_...` exibido pela CLI vai na variável `STRIPE_WEBHOOK_SECRET`.

---

## ✅ Qualidade e segurança

- **Testes:** 8 casos funcionais planejados, 8 aprovados, 0 reprovações
- **Bloqueio automático de datas** validado — zero sobreposição de reservas
- **Senhas** com hash bcrypt (nunca em texto puro)
- **HTTPS** em toda a comunicação
- **Painel restrito** a administradores autenticados
- **Dados de cartão** nunca passam pelo servidor (processados diretamente pelo Stripe)

---

## 🗺️ Roadmap

Próximos passos guiados pelo feedback do cliente:

- [ ] Busca simplificada no padrão Airbnb/Booking (check-in, check-out, nº de hóspedes, tipo)
- [ ] Páginas de acomodação mais completas (amenidades e regras da casa)
- [ ] Páginas de marca e destino (Sobre, Galeria, Experiências, Localização, FAQ)
- [ ] Integração com PMS / Channel Manager (sincronizar calendário e tarifas com Airbnb e Booking)

---

## 👥 Créditos

Projeto originalmente desenvolvido em equipe como trabalho final do **Projeto Aplicado IV** — curso de Desenvolvimento de Sistemas, **UniSENAI Florianópolis**:

- **Karen Cruz** — Fullstack Developer
- **Michel Busquet** — Fullstack Developer
- **Guilherme Nardi** — Fullstack Developer
- **Gustavo Santana** — UX/UI Designer

Repositório original da equipe: [github.com/kcolive/meu-hotel-ypua](https://github.com/kcolive/meu-hotel-ypua)

Este fork é uma **continuação pessoal** mantida por [Michel Busquet](https://github.com/micheldavibusquet), com novas funcionalidades e evolução contínua a partir da base construída em conjunto.

---

## 📄 Licença

Projeto acadêmico. Consulte os autores antes de uso comercial.
