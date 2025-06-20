const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', function connection(ws) {
  clients.push(ws);
  console.log('Cliente WebSocket conectado');

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log('Cliente desconectado');
  });
});

app.post('/notify', (req, res) => {
  const { title, description } = req.body;

  const payload = JSON.stringify({ title, description });
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });

  res.json({ ok: true, sentTo: clients.length });
});

app.get('/', (req, res) => {
  res.status(200).send('Servidor de notificaciones activo');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor WebSockets escuchando en puerto ${PORT}`);
});
