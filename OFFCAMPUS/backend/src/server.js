const app = require('./app');
const { port, frontendPort } = require('./config');
const host = process.env.HOST || '127.0.0.1';

app.listen(port, host, () => {
  console.log(`OffCampus API is running at http://${host}:${port}/api`);
  console.log(`Start the separate frontend at http://127.0.0.1:${frontendPort}`);
});
