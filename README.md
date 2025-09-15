# TechChallenge - Fase2

📌 README – Projeto IADT-FASE 2

Este projeto implementa uma aplicação web para resolver o Problema do Caixeiro Viajante (TSP).
O sistema é composto por dois serviços:

Frontend → Aplicação Angular com mapa interativo (Leaflet).

Backend → API em Python (FastAPI) que resolve o TSP e envia resultados via WebSocket.

Tudo é orquestrado com Docker Compose.

🚀 Funcionalidades

Formulário para o usuário cadastrar cidades/pontos no mapa.

Envio dos dados para o backend via WebSocket.

Cálculo de uma rota aproximada que resolve o problema do TSP.

Exibição visual da rota no mapa.

Arquitetura full containerized (Angular + FastAPI).

📂 Estrutura do Projeto
tsp-project/
├── backend/                # API FastAPI
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Angular + Leaflet
│   ├── src/...
│   ├── angular.json
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml

⚙️ Pré-requisitos

Docker
 instalado.

Docker Compose
 instalado.

Não é necessário instalar Node.js ou Python localmente, tudo roda em containers.

▶️ Como executar o projeto
1. Clonar o repositório
git clone https://github.com/kaduarlindo/IADT-F2-FRONTEND.git
cd IADT-F2-FRONTEND

2. Construir e subir os containers
docker compose up --build

3. Acessar a aplicação

Frontend Angular (mapa) → http://localhost:4200

🔄 Fluxo de execução

O usuário abre o frontend Angular em http://localhost:4200.

Insere cidades/pontos no formulário.

O frontend envia os dados via WebSocket para o backend (/api/ws).

O backend processa e retorna a rota calculada.

O frontend atualiza o mapa Leaflet com a rota ótima.

🛠️ Comandos úteis
Rebuild do projeto
docker compose build

Logs dos serviços
docker compose logs -f frontend
docker compose logs -f backend

Derrubar os containers
docker compose down

Derrubar e limpar volumes
docker compose down -v

🔒 Segurança

As imagens usam Alpine Linux para reduzir tamanho e superfície de ataque.

Dependências são instaladas de forma isolada no container.

Backend roda com Uvicorn (produção-ready).

Frontend servido com Nginx otimizado para SPA.
