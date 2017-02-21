# aRobot

Download RASPBIAN JESSIE LITE and ETCHER and burn the image to an SDCard.

https://www.raspberrypi.org/downloads/raspbian/

https://etcher.io/

### Update firmware

```
sudo apt-get update && apt-get install -y rpi-update && rpi-update
sudo reboot
```

### Install dependencies

```
sudo su

echo "deb http://www.linux-projects.org/listing/uv4l_repo/raspbian/ jessie main" >> /etc/apt/sources.list
curl http://www.linux-projects.org/listing/uv4l_repo/lrkey.asc | sudo apt-key add -
apt-get update && apt-get -f install uv4l uv4l-raspicam uv4l-raspicam-extras uv4l-webrtc && apt-get clean &&
rm -rf /var/lib/apt/lists/*

apt-get update && apt-get -f install git hostapd dnsmasq iproute2 iw raspberrypi-bootloader sense-hat libdbus-1-dev libexpat-dev rabbitmq-server erlang logrotate rfkill python-dev python-smbus python-psutil python-pip python-serial wireless-tools && apt-get clean && rm -rf /var/lib/apt/lists/*

echo '[{rabbit,        [{loopback_users, []}]}].' >> /etc/rabbitmq/rabbitmq.config
rabbitmq-plugins enable rabbitmq_mqtt
rabbitmq-plugins enable rabbitmq_web_stomp
rabbitmq-plugins enable rabbitmq_management
service uv4l_raspicam start

pip install paho-mqtt evdev

apt-get update && apt-get -f install connman  && apt-get clean && rm -rf /var/lib/apt/lists/*

apt-get remove dnsmasq
apt-get autoremove

apt-get update && apt-get upgrade
```

### INSTALL NODE.JS
```
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
```

### ENABLE WIFI & BLUETOOTH
```
connmanctl enable wifi
connmanctl enable bluetooth
```

### ENABLE SERIAL
Remove "console=serial0,115200" from:

```
sudo nano /boot/cmdline.txt
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

### PAIR BT CONTROLLER

### Start on bootup
Add "sudo bash /usr/src/app/start &" to:

```
sudo nano /etc/rc.local
```
