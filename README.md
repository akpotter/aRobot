# aRobot

Download RASPBIAN JESSIE LITE and ETCHER and burn the image to an SDCard.

https://www.raspberrypi.org/downloads/raspbian/

https://etcher.io/

### Update firmware

```
sudo apt-get update && sudo apt-get install -y rpi-update && sudo rpi-update
sudo reboot
```

### Install dependencies

```
sudo su

echo "deb http://www.linux-projects.org/listing/uv4l_repo/raspbian/ jessie main" >> /etc/apt/sources.list
curl http://www.linux-projects.org/listing/uv4l_repo/lrkey.asc | sudo apt-key add -
apt-get update && apt-get -f install uv4l uv4l-raspicam uv4l-raspicam-extras uv4l-webrtc uv4l-raspidisp-extras && apt-get clean &&
rm -rf /var/lib/apt/lists/*

apt-get update && apt-get -f install git hostapd dnsmasq iproute2 iw raspberrypi-bootloader sense-hat libdbus-1-dev libexpat-dev rabbitmq-server erlang logrotate rfkill python-dev python-smbus python-psutil python-pip python-serial wireless-tools bluetooth bluez blueman && apt-get clean && rm -rf /var/lib/apt/lists/*

echo '[{rabbit,        [{loopback_users, []}]}].' >> /etc/rabbitmq/rabbitmq.config
rabbitmq-plugins enable rabbitmq_mqtt
rabbitmq-plugins enable rabbitmq_web_stomp
rabbitmq-plugins enable rabbitmq_management
service uv4l_raspicam start

pip install paho-mqtt evdev

apt-get update && apt-get -f install connman  && apt-get clean && rm -rf /var/lib/apt/lists/*

apt-get update && apt-get upgrade
```

### INSTALL NODE.JS
```
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
```

### ENABLE SERIAL
Remove "console=serial0,115200" from:

```
sudo nano /boot/cmdline.txt
```

Add "dtoverlay=pi3-miniuart-bt" at the end of the file
```
sudo nano /boot/config.txt
sudo reboot
```

### Copy code
```
sudo mkdir -p /usr/src/app/
sudo chown pi /usr/src/app/
cd /usr/src/app/

git clone https://github.com/juano2310/aRobot.git /usr/src/app/
```

### Compile Web code
```
sudo npm install --unsafe-perm --production && npm cache clean
./node_modules/.bin/bower --allow-root install && ./node_modules/.bin/bower --allow-root cache clean
./node_modules/.bin/coffee -c ./src
```

### ENABLE WIFI & BLUETOOTH
```
sudo export DBUS_SYSTEM_BUS_ADDRESS=unix:path=/run/dbus/system_bus_socket
connmanctl enable wifi
connmanctl enable bluetooth
```

### PAIR BLUETOOTH
```
sudo bluetoothctl
```
Put the bluetooth device into pairing mode
```
agent on
default-agent
scan on
```
Copy the address of the device to pair.
```
pair xx:xx:xx:xx:xx (device id)
```
(if asked for a "PIN code" -> enter that "PIN code" on your bluetooth keyboard and press ENTER on the bluetooth keyboard)
```
trust xx:xx:xx:xx:xx (device id)
connect xx:xx:xx:xx:xx (device id)
```

### Start on bootup
Add "sudo bash /usr/src/app/start &" to:

```
sudo nano /etc/rc.local
```

Note: If the hotspot doesn't connect run:

```
sudo apt-get remove dnsmasq
```
