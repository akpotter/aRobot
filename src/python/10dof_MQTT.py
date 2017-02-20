import sys, getopt

sys.path.append('.')
import RTIMU
import os.path
import time
import math
import paho.mqtt.client as mqtt

server = "localhost"
port = 1883
vhost = "/"
username = "guest"
password = "guest"

SETTINGS_FILE = "RTIMULib"

#  computeHeight() - the conversion uses the formula:
#
#  h = (T0 / L0) * ((p / P0)**(-(R* * L0) / (g0 * M)) - 1)
#
#  where:
#  h  = height above sea level
#  T0 = standard temperature at sea level = 288.15
#  L0 = standard temperatur elapse rate = -0.0065
#  p  = measured pressure
#  P0 = static pressure = 1013.25
#  g0 = gravitational acceleration = 9.80665
#  M  = mloecular mass of earth's air = 0.0289644
#  R* = universal gas constant = 8.31432
#
#  Given the constants, this works out to:
#
#  h = 44330.8 * (1 - (p / P0)**0.190263)

def computeHeight(pressure):
    return 44330.8 * (1 - pow(pressure / 1013.25, 0.190263));

print("Using settings file " + SETTINGS_FILE + ".ini")
if not os.path.exists(SETTINGS_FILE + ".ini"):
  print("Settings file does not exist, will be created")

s = RTIMU.Settings(SETTINGS_FILE)
imu = RTIMU.RTIMU(s)
pressure = RTIMU.RTPressure(s)

print("IMU Name: " + imu.IMUName())
print("Pressure Name: " + pressure.pressureName())

if (not imu.IMUInit()):
    print("IMU Init Failed")
    sys.exit(1)
else:
    print("IMU Init Succeeded");

# this is a good time to set any fusion parameters

imu.setSlerpPower(0.02)
imu.setGyroEnable(True)
imu.setAccelEnable(True)
imu.setCompassEnable(True)

if (not pressure.pressureInit()):
    print("Pressure sensor Init Failed")
else:
    print("Pressure sensor Init Succeeded")

poll_interval = imu.IMUGetPollInterval()
print("Recommended Poll Interval: %dmS\n" % poll_interval)

try:
	client = mqtt.Client(client_id="", clean_session=True, userdata=None, protocol="MQTTv31")
	client.username_pw_set(vhost + ":" + username, password)
	client.connect(server, port, keepalive=60, bind_address="") #connect

	while True:
		if imu.IMURead():
			# x, y, z = imu.getFusionData()
			# print("%f %f %f" % (x,y,z))
			data = imu.getIMUData()
			(data["pressureValid"], data["pressure"], data["temperatureValid"], data["temperature"]) = pressure.pressureRead()
			fusionPose = data["fusionPose"]
			r = "{0:.0f}".format(math.degrees(fusionPose[0]))
			if r == "-0":
				r = 0
			p = "{0:.0f}".format(math.degrees(fusionPose[1]))
			if p == "-0":
				p = 0
			y = "{0:.0f}".format(math.degrees(fusionPose[2]) + 90)
			if y == "-0":
				y = 0
			client.publish("robot/r", payload=r, qos=0, retain=False) #publish r
			client.publish("robot/p", payload=p, qos=0, retain=False) #publish p
			client.publish("robot/y", payload=y, qos=0, retain=False) #publish y
			if (data["pressureValid"]):
			    pressured = "{0:.0f}".format(round(data["pressure"],2)*100)
			    altitud= "{0:.0f}".format(round(computeHeight(data["pressure"]),3))
			    client.publish("robot/pressure", payload=pressured, qos=0, retain=False) #publish pressure
			    client.publish("robot/altitud", payload=altitud, qos=0, retain=False) #publish altitud
			if (data["temperatureValid"]):
				temp = round(data["temperature"],1)
				client.publish("robot/temperature", payload=temp, qos=0, retain=False) #publish temperature
			time.sleep(poll_interval*1.0/1000.0)

	client.disconnect()
except Exception, e:
    print e
