const config = require('./settings.json');
console.log("HTTP Port = " + config.HTTPPort);
console.log("WS Port = " + config.WebSocketPort);

const express = require('express');
const app = express();
app.set("view engine", "ejs");

const WebSocket = require('ws');
const wss = new WebSocket.Server({port: config.WebSocketPort})

wss.on('connection', ws => {
  ws.on('close', function close() {
    console.log('disconnected');
  })
  ws.on('message', msg => {
    console.log(`Received message => ${msg}`)
    let inMessage = JSON.parse(msg);
    let m = JSON.stringify({type: "message", message: inMessage.message, line: inMessage.line});
    broadcast(m);
  })
})

function broadcast(message) {
  wss.clients.forEach(function each(client) {
    if(client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  })
}

app.use(express.static('public'));

//about page
app.get('/about', function(_req, res) {
  res.render('pages/about', {testo: "test"});
});

//sender page
app.get('/send', function(_req, res) {
  res.render('pages/send.ejs', {wsPort : config.WebSocketPort, httpPort : config.HTTPPort});
});

//display page
app.get('/display', function(_req, res) {
  res.render('pages/display.ejs', {wsPort : config.WebSocketPort, httpPort : config.HTTPPort});
});

app.listen(config.HTTPPort);
