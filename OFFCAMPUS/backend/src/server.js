const app = require('./app');
const { port } = require('./config');
const host = process.env.HOST || '127.0.0.1';

app.listen(port, host, () => {
  console.log(`OffCampus is running at http://localhost:${port}`);
});
