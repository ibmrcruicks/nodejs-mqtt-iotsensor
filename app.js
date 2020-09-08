var mqtt = require('mqtt');
var url = require('url');
// Parse
var mqtt_url = url.parse(process.env.MQTT_BROKER_HOST || 'mqtt://localhost:1883');
var auth = (mqtt_url.auth || ':').split(':');
var url = "mqtt://" + mqtt_url.host;
var clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
var username= auth[0] + ":" + auth[0]; //if you are on a shared instance
var options = {
  port: mqtt_url.port,
  clientId: clientId,
  //clientId: 'mqtt1',
  username: username,
  password: auth[1]
};

// Create a client connection
var client = mqtt.connect(url, options);

client.on('connect', function() { // When connected
console.log("Connected");
  // subscribe to a topic
  client.subscribe('hello/world', function() {
    // when a message arrives, do something with it
    client.on('message', function(topic, message, packet) {
      console.log("Received:'" + message + "' on '" + topic + "'");
    });
  });

});

var count=0;
  // publish a message to a topic
     function tick(tock) {
      //console.log(tock);
      //console.log(client);
      var temp = ((Math.random()*5)+17).toFixed(2).toString();
      var msg = "{ 'd': { 'deviceId':'"+ clientId + "', 'index': " + count++ + ",'temp': " + temp + "} }";
      if(client.connected){
        client.publish('hello/world', msg, function() {
          console.log("Published:" + msg);
        });
      }
      setTimeout(tick,tock,tock);
     }

// repeat with the interval of 2 seconds
//let timerId = setInterval(tick, 2000);
setTimeout(tick,2000,2000);

    //client.end(); // Close the connection when published
