var username = "guest";
var password = "guest";
var vhost    = "/";
var constatus;
var r;
var p;
var y;
var pressure;
var altitud;
var temperature;
var keyb;
var signalling_server_hostname = location.hostname || "192.168.1.199";
var signalling_server_address = signalling_server_hostname + ':' + (location.port || 8080);
var isFirefox = typeof InstallTrigger !== 'undefined';// Firefox 1.0+

// Use SockJS
Stomp.WebSocketClass = SockJS;
// Stomp.js boilerplate
if (location.search == '?ws') {
  var ws = new WebSocket('ws://' + signalling_server_hostname + ':15674/ws');
} else {
  var ws = new SockJS('http://' + signalling_server_hostname + ':15674/stomp');
}
var client = Stomp.over(ws);

// Key Pressed

function init() {
    if (document.addEventListener) {
       document.addEventListener("keydown",keydown,false);
       //document.addEventListener("keypress",keypress,false);
       document.addEventListener("keyup",keyup,false);
    } else if (document.attachEvent) {
       document.attachEvent("onkeydown", keydown);
       //document.attachEvent("onkeypress", keypress);
       document.attachEvent("onkeyup", keyup);
    } else {
       document.onkeydown= keydown;
       //document.onkeypress= keypress;
       document.onkeyup= keyup;
    }
}

function keydown(e) {
   if (!e) e= event;
   //document.getElementById('keyb').innerHTML = e.keyCode;
   client.connect(username, password, on_connect, on_connection_error, vhost);
   client.send('/topic/robot.commands', {'destination': 'robot/commands'}, e.keyCode);
}

function keyup(e) {
   if (!e) e = event;
   client.connect(username, password, on_connect, on_connection_error, vhost);
   client.send('/topic/robot.commands', {'destination': 'robot/commands'}, '');
   document.getElementById('keyb').innerHTML = "";
}

function keypress(e) {
   if (!e) e = event;
   //document.getElementById('keyb').innerHTML = e.keyCode;
   client.connect(username, password, on_connect, on_connection_error, vhost);
   client.send('/topic', {'reply-to': '/robot/commands'}, e.keyCode);
}

addEventListener("DOMContentLoaded", function() {
    document.getElementById('signalling_server').value = signalling_server_address;
    if (!('MediaSource' in window) || location.protocol !== "https:" || !isFirefox) {
        if (document.getElementById('cast_tab'))
            document.getElementById('cast_tab').disabled = true;
        document.getElementById('cast_screen').disabled = true;
        document.getElementById('cast_window').disabled = true;
        document.getElementById('cast_application').disabled = true;
    }
});

// Key Pressed - END

var ws = null;
var pc;
var audio_video_stream;
var pcConfig = {"iceServers": [
        {"urls": ["stun:stun.l.google.com:19302", "stun:" + signalling_server_hostname + ":3478"]}
    ]};
var pcOptions = {
    optional: [
        {DtlsSrtpKeyAgreement: true}
    ]
};
var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};

RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
var URL =  window.URL || window.webkitURL;

function createPeerConnection() {
    try {
        var pcConfig_ = pcConfig;
        try {
            ice_servers = document.getElementById('ice_servers').value;
            if (ice_servers) {
                pcConfig_.iceServers = JSON.parse(ice_servers);
            }
        } catch (e) {
            alert(e + "\nExample: "
                    + '\n[ {"urls": "stun:stun1.example.net"}, {"urls": "turn:turn.example.org", "username": "user", "credential": "myPassword"} ]'
                    + "\nContinuing with built-in RTCIceServer array");
        }
        console.log(JSON.stringify(pcConfig_));
        pc = new RTCPeerConnection(pcConfig_, pcOptions);
        pc.onicecandidate = onIceCandidate;
        pc.onaddstream = onRemoteStreamAdded;
        pc.onremovestream = onRemoteStreamRemoved;
        console.log("peer connection successfully created!");
    } catch (e) {
        console.log("createPeerConnection() failed");
    }
}

function onIceCandidate(event) {
    if (event.candidate) {
        var candidate = {
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        };
        var command = {
            command_id: "addicecandidate",
            data: JSON.stringify(candidate)
        };
        ws.send(JSON.stringify(command));
    } else {
        console.log("End of candidates.");
    }
}

function onRemoteStreamAdded(event) {
    console.log("Remote stream added:", URL.createObjectURL(event.stream));
    var remoteVideoElement = document.getElementById('remote-video');
    remoteVideoElement.src = URL.createObjectURL(event.stream);
    remoteVideoElement.play();
}

function onRemoteStreamRemoved(event) {
    var remoteVideoElement = document.getElementById('remote-video');
    remoteVideoElement.src = '';
}

function start() {
    bodyload()
    if ("WebSocket" in window) {
        document.getElementById("stop").disabled = false;
        document.getElementById("start").disabled = true;
        document.documentElement.style.cursor ='wait';
        server = document.getElementById("signalling_server").value.toLowerCase();

        var protocol = location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(protocol + '//' + server + '/stream/webrtc');

        function offer(stream) {
            createPeerConnection();
            if (stream) {
                pc.addStream(stream);
            }
            var command = {
                command_id: "offer",
                options: {
                    force_hw_vcodec: document.getElementById("remote_hw_vcodec").checked
                }
            };
            ws.send(JSON.stringify(command));
            console.log("offer(), command=" + JSON.stringify(command));
        }

        ws.onopen = function () {
            console.log("onopen()");

            audio_video_stream = null;
            var cast_mic = document.getElementById("cast_mic").checked;
            var cast_tab = document.getElementById("cast_tab") ? document.getElementById("cast_tab").checked : false;
            var cast_camera = document.getElementById("cast_camera").checked;
            var cast_screen = document.getElementById("cast_screen").checked;
            var cast_window = document.getElementById("cast_window").checked;
            var cast_application = document.getElementById("cast_application").checked;
            var echo_cancellation = document.getElementById("echo_cancellation").checked;
            var localConstraints = {};
            if (cast_mic) {
                if (echo_cancellation)
                    localConstraints['audio'] = { optional: [{ echoCancellation: true }] };
                else
                    localConstraints['audio'] = { optional: [{ echoCancellation: false }] };
            } else if (cast_tab)
                localConstraints['audio'] = { mediaSource: "audioCapture" };
            if (cast_camera)
                localConstraints['video'] = true;
            else if (cast_screen)
                localConstraints['video'] = { frameRate: { ideal: 15, max: 30 }, mozMediaSource: "screen", mediaSource: "screen" };
            else if (cast_window)
                localConstraints['video'] = { frameRate: { ideal: 15, max: 30 }, mozMediaSource: "window", mediaSource: "window" };
            else if (cast_application)
                localConstraints['video'] = { frameRate: { ideal: 15, max: 30 }, mozMediaSource: "application", mediaSource: "application" };
            else
                localConstraints['audio'] = false;

            localVideoElement = document.getElementById('local-video');
            if (localConstraints.audio || localConstraints.video) {
                if (navigator.getUserMedia) {
                    navigator.getUserMedia(localConstraints, function(stream) {
                        audio_video_stream = stream;
                        offer(stream);
                        localVideoElement.muted = true;
                        localVideoElement.src = URL.createObjectURL(stream);
                        localVideoElement.play();
                    }, function(error) {
                        stop();
                        alert("An error has occurred. Check media permissions.");
                        console.log(error);
                    });
                } else {
                    console.log("getUserMedia not supported");
                }
            } else {
                offer();
            }
        };

        ws.onmessage = function (evt) {
            var msg = JSON.parse(evt.data);
            //console.log("message=" + msg);
            console.log("type=" + msg.type);

            switch (msg.type) {
                case "offer":
                    pc.setRemoteDescription(new RTCSessionDescription(msg),
                        function onRemoteSdpSuccess() {
                            console.log('onRemoteSdpSucces()');
                            pc.createAnswer(function (sessionDescription) {
                                pc.setLocalDescription(sessionDescription);
                                var command = {
                                    command_id: "answer",
                                    data: JSON.stringify(sessionDescription)
                                };
                                ws.send(JSON.stringify(command));
                                console.log(command);

                            }, function (error) {
                                alert("Failed to createAnswer: " + error);

                            }, mediaConstraints);
                        },
                        function onRemoteSdpError(event) {
                            alert('Failed to set remote description (unsupported codec on this browser?): ' + event);
                            stop();
                        }
                    );

                    var command = {
                        command_id: "geticecandidate"
                    };
                    console.log(command);
                    ws.send(JSON.stringify(command));
                    break;

                case "answer":
                    break;

                case "message":
                    alert(msg.data);
                    break;

                case "geticecandidate":
                    var candidates = JSON.parse(msg.data);
                    for (var i = 0; i < candidates.length; i++) {
                        var elt = candidates[i];
                        var candidate = new RTCIceCandidate({sdpMLineIndex: elt.sdpMLineIndex, candidate: elt.candidate});
                        pc.addIceCandidate(candidate,
                            function () {
                                console.log("IceCandidate added: " + JSON.stringify(candidate));
                            },
                            function (error) {
                                console.log("addIceCandidate error: " + error);
                            }
                        );
                    }
                    document.documentElement.style.cursor ='default';
                    break;
            }
        };

        ws.onclose = function (evt) {
            if (pc) {
                pc.close();
                pc = null;
            }
            document.getElementById("stop").disabled = true;
            document.getElementById("start").disabled = false;
            document.documentElement.style.cursor ='default';
        };

        ws.onerror = function (evt) {
            alert("An error has occurred!");
            ws.close();
        };

    } else {
        alert("Sorry, this browser does not support WebSockets.");
    }
    setContent()
}

function stop() {
    if (audio_video_stream) {
        try {
            audio_video_stream.stop();
        } catch (e) {
            for (var i = 0; i < audio_video_stream.getTracks().length; i++)
                audio_video_stream.getTracks()[i].stop();
        }
        audio_video_stream = null;
    }
    document.getElementById('remote-video').src = '';
    document.getElementById('local-video').src = '';
    if (pc) {
        pc.close();
        pc = null;
    }
    if (ws) {
        ws.close();
        ws = null;
    }
    document.getElementById("stop").disabled = true;
    document.getElementById("start").disabled = false;
    document.documentElement.style.cursor ='default';
}

function mute() {
    var remoteVideo = document.getElementById("remote-video");
    remoteVideo.muted = !remoteVideo.muted;
}

function pause() {
    var remoteVideo = document.getElementById("remote-video");
    if (remoteVideo.paused)
        remoteVideo.play();
    else
        remoteVideo.pause();
}

function fullscreen() {
    var remoteVideo = document.getElementById("remote-video");
    if(remoteVideo.requestFullScreen){
        remoteVideo.requestFullScreen();
    } else if(remoteVideo.webkitRequestFullScreen){
        remoteVideo.webkitRequestFullScreen();
    } else if(remoteVideo.mozRequestFullScreen){
        remoteVideo.mozRequestFullScreen();
}
}

function remote_hw_vcodec_selection() {
    if (!document.getElementById('remote_hw_vcodec').checked)
        unselect_remote_hw_vcodec();
    else
        select_remote_hw_vcodec();
}

function select_remote_hw_vcodec() {
    document.getElementById('remote_hw_vcodec').checked = true;
    document.getElementById('remote-video').style.width = "640px";
    document.getElementById('remote-video').style.height = "480px";
    /*
    // Disable video casting. Not supported at the moment with hw codecs.
    var elements = document.getElementsByName('video_cast');
    for(var i = 0; i < elements.length; i++) {
        elements[i].checked = false;
    }
    */
}

function unselect_remote_hw_vcodec() {
    document.getElementById('remote_hw_vcodec').checked = false;
    document.getElementById('remote-video').style.width = "640px";
    document.getElementById('remote-video').style.height = "480px";
}

function singleselection(name, id) {
    var old = document.getElementById(id).checked;
    var elements = document.getElementsByName(name);
    for(var i = 0; i < elements.length; i++) {
        elements[i].checked = false;
    }
    document.getElementById(id).checked = old ? true : false;
    /*
    // Disable video hw codec. Not supported at the moment when casting.
    if (name === 'video_cast') {
        unselect_remote_hw_vcodec();
    }
    */
}

window.onbeforeunload = function() {
    if (ws) {
        ws.onclose = function () {}; // disable onclose handler first
        stop();
    }
};



function getWindowHeight() {
	var windowHeight = 0;
	if (typeof(window.innerHeight) == 'number') {
		windowHeight = window.innerHeight;
	}
	else {
		if (document.documentElement && document.documentElement.clientHeight) {
			windowHeight = document.documentElement.clientHeight;
		}
		else {
			if (document.body && document.body.clientHeight) {
				windowHeight = document.body.clientHeight;
			}
		}
	}
	return windowHeight;
}

function getWindowWidth() {
	var windowWidth = 0;
	if (typeof(window.innerWidth) == 'number') {
		windowWidth = window.innerWidth;
	}
	else {
		if (document.documentElement && document.documentElement.clientWidth) {
			windowWidth = document.documentElement.clientWidth;
		}
		else {
			if (document.body && document.body.clientWidth) {
				windowWidth = document.body.clientWidth;
			}
		}
	}
	return windowWidth - 1 -260;
}

function setContent() {
	var video = document.getElementById("remote-video");
	var vidwitdh = getWindowWidth()
	var maxwitdh = 1200
	if (vidwitdh > maxwitdh)
		vidwitdh = maxwitdh
	video.style.width =  vidwitdh + "px";
	video.style.height = vidwitdh * 0.75 + "px";
	if (document.getElementById) {
		var windowHeight = getWindowHeight();
		if (windowHeight > 0) {
			var contentHeight = video.offsetHeight - 100;
			if (windowHeight - contentHeight > 0) {
				video.style.position = 'relative';
				var overlay = document.getElementById("overlay");
				var rightcol = document.getElementById("rightcol");
				var videoContainer = document.getElementById("videoContainer");
				overlay.style.top = (contentHeight - 110) + 'px';
				videoContainer.style.top = ((windowHeight / 2) - (contentHeight / 2)) + 'px';
				rightcol.style.marginTop = ((windowHeight / 2) - (contentHeight / 2)) + 'px';
				rightcol.style.height = contentHeight + 'px';
			}
			else {
				video.style.position = 'static';
			}
		}
	}
}
window.onload = function() {
	setContent();
}
window.onresize = function() {
	setContent();
}
//-->


function on_connect() {
  constatus.innerHTML = 'Online';
  r.innerHTML = 'Waiting...';
  p.innerHTML = 'Waiting...';
  y.innerHTML = 'Waiting...';
  pressure.innerHTML = 'Waiting...';
  altitud.innerHTML = 'Waiting...';
  temperature.innerHTML = 'Waiting...';
  console.log(client);
  client.subscribe("/topic/robot.r.#", on_message_r);
  client.subscribe("/topic/robot.p.#", on_message_p);
  client.subscribe("/topic/robot.y.#", on_message_y);
  client.subscribe("/topic/robot.pressure.#", on_message_pressure);
  client.subscribe("/topic/robot.altitud.#", on_message_altitud);
  client.subscribe("/topic/robot.temperature.#", on_message_temp);
  client.subscribe("/topic/robot.commands.#", on_message_command);
}

function on_connection_error() {
  constatus.innerHTML = 'Connection failed!';
}

function on_message_r(m) {
  console.log('R Received:' + m);
  r.innerHTML = m.body + "&deg;";
}

function on_message_p(m) {
  console.log('P Received:' + m);
  p.innerHTML = m.body + "&deg;";
}

function on_message_y(m) {
  console.log('Y Received:' + m);
  y.innerHTML = m.body + "&deg;";
}

function on_message_pressure(m) {
  console.log('Pressure Received:' + m);
  pressure.innerHTML = m.body + "Pa";
}

function on_message_altitud(m) {
  console.log('Altitud Received:' + m);
  altitud.innerHTML = m.body + "m";
}

function on_message_temp(m) {
  console.log('Temperature Received:' + m);
  temperature.innerHTML = m.body + "&deg;C";
}

function on_message_command(m) {
  console.log('Command Received:' + m);
  var commandm
  switch (m.body) {
  	case "38":
  		commandm = 'FOWARD';
  		break;
  	case "40":
  		commandm = 'BACKWARD';
  		break;
  	case "37":
  		commandm = 'LEFT';
  		break;
  	case "39":
  		commandm = 'RIGHT';
  		break;
    default:
    	commandm =  String.fromCharCode(m.body);
		break;
  }
  keyb.innerHTML = commandm;
}

function bodyload() {
	constatus = document.getElementById("constatus");
	r = document.getElementById("r");
	p = document.getElementById("p");
	y = document.getElementById("y");
	pressure = document.getElementById("pressure");
	altitud = document.getElementById("altitud");
	temperature = document.getElementById("temperature");
	keyb = document.getElementById("keyb");
  // Connect
  client.connect(username, password, on_connect, on_connection_error, vhost);
  init();
}
