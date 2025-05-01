💬 Furia WebChat

Este é um projeto de chat em tempo real desenvolvido como desafio técnico para a Furia Tech. A aplicação é composta por um backend Node.js (Express + MongoDB) e um frontend React com Next.js + TypeScript, utilizando Socket.IO para comunicação em tempo real.

📁 Estrutura do Projeto

furia_webchat/
├── backend/     # Servidor Express + MongoDB + Autenticação
├── frontend/    # Aplicação Next.js com Tailwind CSS
└── README.md    # Este arquivo

🔧 Tecnologias Utilizadas

🔙 Backend
- Node.js + Express
- TypeScript

- MongoDB (via Mongoose)

- Autenticação JWT

- Validações com express-validator

- Criptografia com bcrypt

- Socket.IO para WebSockets

- Testes com Jest + Supertest

🔜 Frontend

- React 19 + Next.js 15

- TypeScript

- Tailwind CSS

- WebSocket com socket.io-client

Funcionalidades
- ✅ Registro e login de usuários com autenticação JWT

- ✅ Criação e persistência de mensagens

- ✅ Conexão e troca de mensagens em tempo real via WebSocket

- ✅ UI simples e funcional com estados de conexão e envio

- ✅ Código limpo, testável e modularizado

📁 Estrutura de Pastas

Backend (/backend)
- src/app.ts: Configuração do servidor Express + WebSocket

- src/routes/: Rotas de autenticação e mensagens

- src/controllers/: Lógica dos endpoints

- src/models/: Modelos Mongoose

- src/middlewares/: Middlewares de autenticação e validação

Frontend (/frontend)
- pages/: Páginas Next.js (index.tsx, login.tsx, etc.)

- components/: Componentes reutilizáveis (ChatBox, MessageInput, etc.)

- services/socket.ts: Configuração do WebSocket

