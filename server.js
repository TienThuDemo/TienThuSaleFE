import jsonServer from 'json-server';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

const port = process.env.PORT || 3001;

server.listen(port, '0.0.0.0', () => {
  console.log(`JSON Server running on port ${port}`);
});