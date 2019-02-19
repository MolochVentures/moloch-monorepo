import { MolochBackendApplication } from './application';
import { ApplicationConfig } from '@loopback/core';
const cron = require("node-cron");
const http = require('http');

export { MolochBackendApplication };

export async function main(options: ApplicationConfig = {}) {
  const app = new MolochBackendApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;

  cron.schedule("*/59 * * * *", function () {
    var options = {
      port: 3001,
      path: '/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    var req = http.request(options, function (res: any) {
      res.setEncoding('utf8');
      res.on('data', function (body: any) {
        console.log('Cron job exexuted: ' + body);
      });
    });

    req.on('error', function (e: any) {
      console.log('Error executing cron job: ' + e.message);
    });

    req.write(JSON.stringify({ id: "", name: "Cron job", payload: {} }));
    req.end();
  });

  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
