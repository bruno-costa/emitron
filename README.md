# 🚀 emitron

Servidor **Pub/Sub** simples e rápido usando **Server-Sent Events (SSE)** e **Redis** como broker.
Feito com [Bun](https://bun.sh/) + [Elysia](https://elysiajs.com/), suporta múltiplas instâncias e escala horizontalmente.

![License](https://img.shields.io/badge/license-MIT-blue)
![Bun](https://img.shields.io/badge/Bun-1.x-black?logo=bun)
![Redis](https://img.shields.io/badge/Redis-7.x-red?logo=redis)

---

## ✨ Recursos

* **Publish/Subscribe** por fila usando SSE
* Escalável via **Redis Pub/Sub**
* **Replay Buffer** persistente no Redis (últimas N mensagens)
* **CORS** habilitado (pronto para browser)
* Modular e fácil de estender
* **Heartbeat** automático para evitar timeouts
* Pronto para rodar em Docker/Kubernetes

---

## 📦 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/bruno-costa/emitron.git
cd emitron
```

### 2. Rodar localmente com Bun

```bash
export REDIS_URL=redis://localhost:6379
bun install
bun run dev
```

O servidor subirá em [http://localhost:3000](http://localhost:3000).

---

## 🐳 Rodar com Docker Compose

```bash
docker compose up -d
```

Isso inicia o servidor em [http://localhost:3000](http://localhost:3000). 

---

## ⚙️ Variáveis de ambiente

| Variável         | Padrão               | Descrição                                       |
| ---------------- | -------------------- | ----------------------------------------------- |
| `REDIS_URL`      | `redis://redis:6379` | URL de conexão do Redis                         |
| `CHANNEL_PREFIX` | `emitron`            | Prefixo dos canais no Redis                     |
| `HEARTBEAT_MS`   | `15000`              | Intervalo do heartbeat SSE (ms)                 |
| `RETRY_MS`       | `10000`              | Tempo de reconexão do SSE no cliente (ms)       |
| `REPLAY_MAX`     | `100`                | Máximo de mensagens mantidas no buffer por fila |

---

## 🔌 Endpoints

### **Assinar uma fila (SSE)**

```
GET /sub/:queue
```

Parâmetros de query:

* `replay=N` → envia as últimas N mensagens armazenadas no buffer dessa fila antes de começar o stream ao vivo (limite: `REPLAY_MAX`).

Exemplo:

```bash
curl -N "http://localhost:3000/sub/news?replay=10"
```

---

### **Publicar mensagem**

```
POST /pub/:queue
```

Envia uma mensagem para todos os assinantes da fila `:queue`.

Body:

```json
{
  "data": { "msg": "Hello world!" }
}
```

Exemplo:

```bash
curl -X POST http://localhost:3000/pub/news \
  -H "Content-Type: application/json" \
  -d '{"data":{"msg":"Hello world!"}}'
```

---

### **Limpar buffer de uma fila**

```
DELETE /buffer/:queue
```

Remove o **replay buffer** (últimas mensagens) do tópico informado. Útil para zerar o histórico antes de um teste ou após um deploy.

Exemplo:

```bash
curl -X DELETE http://localhost:3000/buffer/news
```

Resposta típica:

```json
{ "ok": true, "queue": "news", "removed": true, "message": "Buffer de \"news\" limpo" }
```

---

### **Health check**

```
GET /health
```

Retorna o status do servidor e do Redis:

```json
{
  "ok": true,
  "redis": "up"
}
```

---

## 🖥️ Exemplo no Browser

```html
<script>
  const es = new EventSource('http://localhost:3000/sub/news?replay=5')

  es.onmessage = (e) => {
    const payload = JSON.parse(e.data)
    console.log('Mensagem recebida:', payload)
  }

  es.onerror = (err) => {
    console.error('Erro SSE', err)
  }
</script>
```

---

## ⚡ Exemplo em Node.js

```js
import EventSource from 'eventsource'
import fetch from 'node-fetch'

const es = new EventSource('http://localhost:3000/sub/news?replay=5')

es.onmessage = (e) => {
    console.log('Mensagem recebida:', JSON.parse(e.data))
}

// Publicar uma mensagem
await fetch('http://localhost:3000/pub/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { msg: 'Hello subscribers' } })
})
```

---

## 📡 Escalando com múltiplas instâncias

O **emitron** usa o **Redis Pub/Sub** para propagar mensagens entre instâncias e armazena o buffer de replay diretamente no Redis.
Basta colocar várias instâncias atrás de um Load Balancer, apontando para o mesmo Redis.

---

## 🛠️ Ambiente de desenvolvimento com override

Para facilitar o desenvolvimento local, crie um arquivo `docker-compose.local.yml` (que deve estar no `.gitignore`) com o seguinte conteúdo:

```yml
version: "3.8"
services:
  emitron:
    command: bun run dev
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
      - /app/node_modules
      - /app/bun.lockb
```

E rode o projeto com:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d
```

Isso irá iniciar o servidor no modo **dev** com hot reload e mapeamento de volumes para seu código local.

---

## 📜 Licença

[MIT](LICENSE) © 2025 [Bruno Avelino](https://github.com/bruno-costa)
