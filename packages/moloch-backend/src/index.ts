import { MolochBackendApplication } from './application';
import { ApplicationConfig } from '@loopback/core';
import { ChainsawController } from './controllers/chainsaw.controller';
const cron = require("node-cron");
const http = require('http');
const https = require('https');
const request = require('request');

export { MolochBackendApplication };

export async function main(options: ApplicationConfig = {}) {
  const app = new MolochBackendApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;

  // poll contract for events
  cron.schedule("1 * * * * *", function () {
    console.log("Running poller to query contract");

    var options = {
      port: 3001,
      path: '/chainsaw',
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

    req.write(JSON.stringify({ id: "", name: "chainsaw", payload: {} }));
    req.end();
  });

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

  cron.schedule("0 0 * * *", function () {
    request("https://api.coinmarketcap.com/v1/ticker/ethereum/", function(error: any, response: any, body: any) {
      if (error) return console.log(error);
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
          console.log('Cron job exexuted to update the graph');
        });
      });
  
      req.on('error', function (e: any) {
        console.log('Error executing cron job to update the graph: ' + e.message);
      });
  
      req.write(JSON.stringify({ id: "", name: "Graph update", payload: {body} }));
      req.end();
    });
  });

  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
