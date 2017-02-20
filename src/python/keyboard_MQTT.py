import evdev
import paho.mqtt.client as mqtt

server = "localhost"
port = 1883
vhost = "/"
username = "guest"
password = "guest"
selectedDevice = None

try:
    # set up mqtt client
	client = mqtt.Client(client_id="", clean_session=True, userdata=None, protocol="MQTTv31")
	client.username_pw_set(vhost + ":" + username, password)
	client.connect(server, port, keepalive=60, bind_address="") #connect
    	client.loop_start()
except Exception, e:
	print e
		
def connect_controller(selectedDevice):
	while selectedDevice is None:
		devices = [evdev.InputDevice(fn) for fn in evdev.list_devices()]
		for device in devices:
			#print (device.name)
			if ('Game Controller' in device.name):
				selectedDevice = evdev.InputDevice(device.fn)
				print(selectedDevice)
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

connect_controller(selectedDevice)

