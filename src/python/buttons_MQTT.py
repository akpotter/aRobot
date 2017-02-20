from sense_hat import SenseHat, ACTION_PRESSED, ACTION_HELD, ACTION_RELEASED
from signal import pause
import paho.mqtt.client as mqtt

server = "localhost"
port = 1883
vhost = "/"
username = "guest"
password = "guest"

sense = SenseHat()

print("Starting Buttons to MQTT")

try:
    # set up mqtt client
	client = mqtt.Client(client_id="", clean_session=True, userdata=None, protocol="MQTTv31")
	client.username_pw_set(vhost + ":" + username, password)
	client.connect(server, port, keepalive=60, bind_address="") #connect
    	client.loop_start()
except Exception, e:
	print e

def joystick_pushed(event):
    client.publish("commands/joystick", event.direction + "_" + event.action)

sense.stick.direction_any = joystick_pushed
pause()
