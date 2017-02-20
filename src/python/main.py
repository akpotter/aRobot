import threading
import time
import roboclaw
import paho.mqtt.client as mqtt
import subprocess
import evdev
from sense_hat import SenseHat
from signal import pause


server = "localhost"
port = 1883
vhost = "/"
username = "guest"
password = "guest"
topic = "commands/#"

sense = SenseHat()
sense.clear()
sense.set_rotation(90)
sense.set_imu_config(False, True, False)

#Yellow TX - S1
#Orange RX - S2
roboclaw.Open("/dev/serial0",115200)

address = 0x80

roboclaw.ForwardMixed(address, 0)
roboclaw.TurnRightMixed(address, 0)

def onConnect(client, userdata, rc):    #event on connecting
    client.subscribe([(topic, 1)])  #subscribe
    w = threading.Thread(target=joystick_MQTT)
    w2 = threading.Thread(target=slow_sensors_MQTT)
    w3 = threading.Thread(target=fast_sensors_MQTT)
    selectedDevice = None 
    w4 = threading.Thread(target=connect_controller, args=(selectedDevice,))    
    w.start()
    w2.start()
    w3.start()
    w4.start()    
    print("Ready")
    sense.show_message("Ready", text_colour=[255, 0, 255])    

def onMessage(client, userdata, message):   #event on receiving message
	roboAction = ""
	if message.payload == "38" or message.payload == "up_pressed":
		roboclaw.ForwardMixed(address, 64)
		roboAction = "Moving Forward"
	elif message.payload == "40" or message.payload == "down_pressed":
		roboclaw.BackwardMixed(address, 64)
		roboAction = "Moving Backward"
	elif message.payload == "37" or message.payload == "left_pressed":
		roboclaw.TurnLeftMixed(address, 64)
		roboAction = "Turning Left"
	elif message.payload == "39" or message.payload == "right_pressed":
		roboclaw.TurnRightMixed(address, 64)
		roboAction = "Turning Right"
	elif message.payload == "middle_held":
		subprocess.call(["node", "/usr/src/app/src/app.js", "--clear=true"])
		roboAction = "Reset WiFi"
	elif message.payload == "" or message.payload.find("released") != -1 :
		roboclaw.ForwardMixed(address, 0)
		roboclaw.BackwardMixed(address, 0)
		roboclaw.TurnRightMixed(address, 0)
		roboclaw.TurnLeftMixed(address, 0)
		roboAction = "Stop"		
	if roboAction != "":	#Remove this IF to show all MQTT messages
		print("Action: " + roboAction + ", Topic: " + message.topic + ", Message: " + message.payload)

def joystick_pushed(event):
    client.publish("commands/joystick", event.direction + "_" + event.action)

def slow_sensors_MQTT():
	while True:
            client.publish("sensor/temp", round(sense.get_temperature(),1))
            client.publish("sensor/humidity", round(sense.get_humidity(),0))
            client.publish("sensor/pressure", round(sense.get_pressure(),0))
            time.sleep(100)

def fast_sensors_MQTT():
	while True:
            accel_only = sense.get_accelerometer()
            client.publish("sensor/pitch", "{pitch}".format(**accel_only))
            client.publish("sensor/roll", "{roll}".format(**accel_only))
            client.publish("sensor/yaw", "{yaw}".format(**accel_only))

def joystick_MQTT():
    sense.stick.direction_any = joystick_pushed
    pause()

def connect_controller(selectedDevice):
	while selectedDevice is None:
		devices = [evdev.InputDevice(fn) for fn in evdev.list_devices()]
		for device in devices:
			if ('Game Controller' in device.name):
				selectedDevice = evdev.InputDevice(device.fn)
				print(selectedDevice)
				sense.show_message('CC', text_colour=[255, 0, 255])    
				listener(selectedDevice)

def listener(selectedDevice):
	try:
		for event in selectedDevice.read_loop():
			if (event.type == evdev.ecodes.EV_KEY) and (event.value == 1):
				#print event
				#ADD ALL BUTTONS!!!!!!!!!!
				if event.code == 17:
					client.publish("commands/gamepad", "up_pressed")
				elif event.code == 18:
					client.publish("commands/gamepad", "up_released")
				elif event.code == 32:
					client.publish("commands/gamepad", "right_pressed")
				elif event.code == 46:
					client.publish("commands/gamepad", "right_released")
				elif event.code == 45:
					client.publish("commands/gamepad", "down_pressed")
				elif event.code == 44:
					client.publish("commands/gamepad", "down_released")
				elif event.code == 30:
					client.publish("commands/gamepad", "left_pressed")
				elif event.code == 16:
					client.publish("commands/gamepad", "left_released")	            
	except Exception, e:
		print "Controller disconnected"
		selectedDevice = None
		connect_controller(selectedDevice)

while True:
    try:
    	print "Connecting to MQTT Server..."
        client = mqtt.Client(client_id="", clean_session=True, userdata=None, protocol="MQTTv31")
        client.username_pw_set(vhost + ":" + username, password)
        client.on_connect = onConnect
        client.on_message = onMessage
        client.connect(server, port, keepalive=60, bind_address="") #connect
        client.loop_forever()   #automatically reconnect once loop forever
    except Exception, e:
        #when initialize connection, reconnect on exception
        print "MQTT Server not ready, reconnecting..."
        time.sleep(10)
