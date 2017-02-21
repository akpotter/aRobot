# aRobot

Download RASPBIAN JESSIE LITE and ETCHER and burn the image.
https://www.raspberrypi.org/downloads/raspbian/

https://etcher.io/

### Install dependencies

```sudo su
echo "deb http://www.linux-projects.org/listing/uv4l_repo/raspbian/ jessie main" >> /etc/apt/sources.list
curl http://www.linux-projects.org/listing/uv4l_repo/lrkey.asc | sudo apt-key add -
apt-get update && apt-get -f install uv4l uv4l-raspicam uv4l-raspicam-extras uv4l-webrtc && apt-get clean &&
rm -rf /var/lib/apt/lists/*

apt-get update && apt-get -f install hostapd dnsmasq iproute2 iw raspberrypi-bootloader sense-hat libdbus-1-dev libexpat-dev rabbitmq-server erlang logrotate rfkill python-dev python-smbus python-psutil python-pip python-serial wireless-tools && apt-get clean && rm -rf /var/lib/apt/lists/*

echo '[{rabbit,        [{loopback_users, []}]}].' >> /etc/rabbitmq/rabbitmq.config
rabbitmq-plugins enable rabbitmq_mqtt
rabbitmq-plugins enable rabbitmq_web_stomp
rabbitmq-plugins enable rabbitmq_management
service uv4l_raspicam start

pip install paho-mqtt evdev

apt-get update && apt-get install -y rpi-update && rpi-update

sudo apt-get update && apt-get -f install connman  && apt-get clean && rm -rf /var/lib/apt/lists/*
sudo apt-get upgrade

sudo apt-get remove dnsmasq

connmanctl enable wifi
connmanctl enable bluetooth```

### PAIR BT CONTROLLER


### INSTALL NODE.JS
```wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb```


### ENABLE SERIAL
Remove "console=serial0,115200" from:

```sudo nano /boot/cmdline.txt```

### Copy code
```mkdir -p /usr/src/app/
chown pi /usr/src/app/
cd /usr/src/app/

git clone https://github.com/juano2310/aRobot.git```


### Compile Code
```sudo npm install --unsafe-perm --production && npm cache clean
./node_modules/.bin/bower --allow-root install && ./node_modules/.bin/bower --allow-root cache clean
./node_modules/.bin/coffee -c ./src```

### Start on bootup
Add "sudo bash /usr/src/app/start &" to:

```sudo nano /etc/rc.local```
