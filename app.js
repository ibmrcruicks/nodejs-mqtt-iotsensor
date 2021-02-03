const DNS = require('dns');
const MQTT = require('mqtt');
const uri = require('url');
const express = require('express');
const HTTP = require("http");
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 3000;

var mqttURI = uri.parse(process.env.MQTT_BROKER_URI || 'mqtt://localhost:1883');
var auth = [process.env.MQTT_BROKER_USER,process.env.MQTT_BROKER_PASS];
var mqttUrl = mqttURI.protocol + "//" + mqttURI.host;
console.log(mqttURI)
const clientId = 'mqtt_iot_' + Math.random().toString(16).substr(2, 8);
const mqttSubTopic = "hello" ;
const mqttPubTopic = mqttSubTopic + "/" + clientId;

DNS.lookup(mqttURI.hostname,function(err,addr,fam){
  if(err || mqttURI.hostname === ''){
    console.log("MQTT Broker host " + mqttURI.hostname + " does not resolve to IP address");
    console.log(err);
    process.exit(16);
  }
  console.log("MQTT Broker host " + mqttURI.hostname + " resolves to " + addr)
});

var mqttOptions = {
  protocol: mqttURI.protocol.split(":")[0],
  rejectUnauthorized: false,
  clean: true,
  port: mqttURI.port,
  clientId: clientId,
  username: auth[0],
  password: auth[1]
};

var server = HTTP.createServer(app)
var wsConnected = false
var wsSender;
const wsPath = "/ticker";

var wsServer = new WebSocket.Server({server: server, path: wsPath})
wsServer.on('connection',function(socket){
  wsConnected = true;
  wsSender = socket;
});

// Create a client connection
var mqttClient = MQTT.connect(mqttUrl, mqttOptions);

mqttClient.on("error", (e) => {
  console.log("MQTT error." + e.message);
});

mqttClient.on('connect', function() { // When connected
  console.log("MQTT connected");
  mqttClient.subscribe(mqttSubTopic + "/#", function() {
    mqttClient.on('message', function(topic, message, packet) {
      var strmsg = "[" + topic + "]:" + message.toString(); // message arrives as a Buffer
      console.log(strmsg);
      if (wsConnected) {
        wsSender.send(strmsg)
      };
    });
  })
});

// observation features
var count = 0;
var tock = 2000;
var settemp = 20;
var humidity = 75;

// in each timeout, publish an observation to MQTT topic
function tick(wait) {
  var temp = 1.0 * ((Math.random()*5)+17).toFixed(2) ; //random temp 17-22
  var msg = { d:
                { deviceId: clientId,
                  index: count++,
                  temp: temp,
                  settemp: settemp,
                  humidity: humidity,
                  wait: tock
                },
                timestamp: Math.floor(Date.now()/1000)
              };
  if(mqttClient.connected){
    mqttClient.publish(mqttPubTopic, JSON.stringify(msg), function() {
    });
  }
  setTimeout(tick,tock,tock);
}
// start publish/subscribe timer
setTimeout(tick,tock,tock);

function makeForm(msg){
  var html = "";
  html += "<html><head><title>IOT Simulator</title><link rel=stylesheet href='/styles.css'></head><body>";
  html += "<!-- simple websocket listener to update page with newest event -->";
  html += "<script>";
  html += "var wsListener = new WebSocket(((window.location.protocol === 'https:') ? 'wss://' : 'ws://') + window.location.host + '" +wsPath+ "');"
  html += "wsListener.onmessage = function(event){document.getElementById('"+wsPath+"').innerHTML=event.data};"
  html += "</script>";
  html += "<h1>"+clientId+"</h1>"
  html += msg || "&nbsp;";
  html +="<form method=post>";
  html += "<table>"
  html += "<tr>"
  html += "<td><label for=timer>Publishing interval</label></td>";
  html += "<td><input type=range name=timer min=1 max=30 value="+tock/1000;
  html += " oninput='o_timer.value=this.value;'></td>";
  html += "<td><output name=o_timer for=timer>"+tock/1000+"</output></td>"
  html += "</tr>"
  html += "<tr>"
  html += "<td><label for=timer>Set temperature</label></td>";
  html += "<td><input type=range name=settemp min=-10 max=40 value="+settemp;
  html += " oninput='o_settemp.value=this.value;'></td>";
  html += "<td><output name=o_settemp for=settemp>"+settemp+"</output></td>"
  html += "</tr>"
  html += "<tr>"
  html += "<td><label for=timer>Humidity</label></td>";
  html += "<td><input type=range name=humidity min=1 max=100 value="+humidity;
  html +=" oninput='o_humidity.value=this.value;'></td>";
  html += "<td><output name=o_humidity for=humidity>"+humidity+"</output></td>"
  html += "</tr>"
  html += "</table>"
  html += "<input type=submit value=Update>";
  html += "</form>";
  html += "<div id='"+wsPath+"'></div>";
  html += "</body></html>";
  return html;
}

// get ready to parse form submission
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('assets'))

//Send the form
app.get('/', (req, res) => {
  res.send(makeForm())
})
//receive form input, and adjust observations
app.post('/',(req, res) => {
  if(req.body.timer){
    tock = parseInt(req.body.timer)*1000;  // convert to milliseconds
  }
  if(req.body.settemp){
    settemp = parseInt(req.body.settemp);
  }
  if(req.body.humidity){
    humidity = parseInt(req.body.humidity);
  }
  //respond with the form
  res.send(makeForm("Timer now: "+tock+" milliseconds"))
})

//off we go
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
