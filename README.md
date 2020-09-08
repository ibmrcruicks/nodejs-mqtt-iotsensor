# nodejs-mqtt-iotsensor
sensor emulator with raw MQTT - configure via env with broker creds and topic

![mqtt](/assets/mqtt-hor-neg.png)

A simple [MQTT](https://mqtt.org) publisher that generates a JSON observation document to an MQTT Broker - example below:

```
{ d: 
  { deviceId: "mqtts-iot-2345",
    temp: 28.34,
    counter: 736
   }
  timestamp: 15202020202
}
```

To run this , you will need a Node.js runtime (local, container, Cloud Foundry, for example), and the connection credentials for an MQTT Broker.

## Environment settings

```
MQTT_BROKER_HOST=<hostname> || localhost
MQTT_BROKER_PORT=<tcp-port#> || 1883
MQTT_BROKER_USER=<username>
MQTT_BROKER_PASS=<password>
MQTT_PUB_TOPIC=<your topic hierarchy> || hello
MQTT_PUB_TIMER=<publish interval> || 2000 (milliseconds)
```

## Running in the IBM Cloud

This app can be run as a Cloud Foundry node.js application, by ]
1. cloning this repository locally, and using the [ibmcloud cli](https://cloud.ibm.com/docs/cli?topic=cli-install-ibmcloud-cli) `ibmcloud cf push` command
1. cloning/forking this repository to github, creating an [open toolchain], and linking to your copy of the repository

You can create a free MQTT Broker using [cloudamqp](https://cloud.ibm.com/catalog/services/cloudamqp), 
use free cloud-based brokers like [eclipse IOT](https://mqtt.eclipse.org/), or [hivemq](https://www.hivemq.com/public-mqtt-broker/)
