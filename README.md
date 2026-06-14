# Villa Daniella Beach Homes

Sistema web para gerenciamento de hospedagens, reservas e usuários, desenvolvido como Projeto Aplicado IV do SENAI.

## Integrantes

* Karen Oliveira
* Michel Busquet
* Guilherme Nardi
* Gustavo Santana Jacinto

## Sistema Publicado

https://villa-daniella.vercel.app

## Funcionalidades

* Cadastro e autenticação de usuários
* Visualização de acomodações
* Página detalhada das acomodações
* Sistema de reservas
* Integração com Stripe para pagamentos
* Avaliações de hospedagem
* Perfil do usuário
* Painel administrativo com Sanity CMS
* Gerenciamento de acomodações
* Gerenciamento de reservas

## Tecnologias Utilizadas

* Next.js
* React
* TypeScript
* Tailwind CSS
* Sanity CMS
* NextAuth
* Stripe
* Vercel

## Contexto do Projeto

Este projeto foi desenvolvido como continuidade de uma solução previamente iniciada em etapas anteriores da disciplina. Ao longo deste semestre, a equipe realizou evolução funcional, correções, melhorias de interface, integração de serviços externos e estabilização da aplicação para entrega da versão atual.


## COMO INICIAR O PROJETO

### Pré-requisitos

* Node.js 20
* NPM

Caso não tenha o NPM instalado, consulte:

https://abre.ai/alura-aprenda-a-instalar-o-npm

### Instalação

No diretório raiz do projeto (onde está localizado o arquivo `package.json`), execute:

```bash
nvm install 20
nvm use 20
npm install --legacy-peer-deps
```

### Executar o Projeto

```bash
npm run dev
```

ou

```bash
yarn dev
```

ou

```bash
pnpm dev
```

Após iniciar o projeto, acesse:

http://localhost:3000

### Configuração do Ambiente

Caso ocorra erro relacionado às variáveis de ambiente, verifique se o arquivo `.env` está configurado corretamente.

No contexto acadêmico do SENAI, as credenciais podem ter sido disponibilizadas no AVA juntamente com a entrega.

## EXPORTAR BANCO DE DADOS
Comando para exportar o banco de dados através do terminal.

```bash
curl https://[ADICIONE-AQUI-O-PROJECTID-DO-SANITY.IO].api.sanity.io/v2021-06-07/data/export/production?types=account,booking,hotelRoom,index,review,user,verificationToken > backup.ndjson```

Exemplo: curl https://sc0ziy2k.api.sanity.io/v2021-06-07/data/export/production?types=account,booking,hotelRoom,index,review,user,verificationToken > backup.ndjson

## IMAGEM DO PROJETO: CLIENTE

![Captura de tela de 2024-06-29 13-16-44](https://github.com/raldineyr/algorithms-and-data-structures/assets/64384382/75d69223-db00-4d0a-b018-425242b42183)
![Captura de tela de 2024-06-29 13-16-55](https://github.com/raldineyr/algorithms-and-data-structures/assets/64384382/83ffff7a-5a19-4815-b429-23ecc07682e6)
![Captura de tela de 2024-06-29 13-17-03](https://github.com/raldineyr/algorithms-and-data-structures/assets/64384382/3559b486-dedd-437f-bc2d-1d6b806f2ec3)
![Captura de tela de 2024-06-29 13-17-28](https://github.com/raldineyr/algorithms-and-data-structures/assets/64384382/4edec4af-9039-4f90-bf3b-dfa53f69f7df)
![Captura de tela de 2024-06-29 13-17-40](https://github.com/raldineyr/algorithms-and-data-structures/assets/64384382/f440d6e5-d258-4188-b381-c6e26123b029)
![Captura de tela de 2024-06-29 13-17-49](https://github.com/raldineyr/algorithms-and-data-structures/assets/64384382/55464d05-786e-4e50-8b1a-da9552c06b66)



## IMAGEM DO PROJETO: ADMINSTRADOR

OBS: SERÁ NECESSÁRIO FAZER UM CADASTRO NO SANITY.io

[http://localhost:3000/studio/structure](http://localhost:3000/studio/structure) 

![Captura de tela de 2024-06-29 13-21-26](https://github.com/raldineyr/algorithms-and-data-structures/assets/64384382/30d31af5-59ef-4167-b81b-3d1e76b1c03d)







