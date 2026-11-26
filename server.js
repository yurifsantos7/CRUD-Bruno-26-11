const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'public')
});

const PORT = process.env.PORT || 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

server.use(router);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor TechStore rodando na porta ${PORT}`);
});