/* eslint-disable no-unused-vars */
/* global require, process */
// eslint-disable-next-line no-unused-vars

import path from 'path';
import jsonServer from 'json-server';

const server = jsonServer.create();
const router = jsonServer.router(path.join('dist', 'db', 'app.json'));
const middlewares = jsonServer.defaults({
  static: 'dist',
  noCors: true,
});
const port = process.env.PORT || 3131;

server.use(middlewares);
server.use(router);

server.listen(port);

export default server;
