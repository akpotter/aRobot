# ------------------------------------------------------------------------------
# Python program using the library to interface with the arduino sketch above.
# ------------------------------------------------------------------------------

import PyCmdMessenger


left = 0
right = 0

# Initialize an ArduinoBoard instance.  This is where you specify baud rate and
# serial timeout.  If you are using a non ATmega328 board, you might also need
# to set the data sizes (bytes for integers, longs, floats, and doubles).  
myarduino = PyCmdMessenger.ArduinoBoard("/dev/ttyACM0",baud_rate=9600)

# List of commands and their associated argument formats. These must be in the
# same order as in the sketch.
commands = [["motors","iii"], # motor power, left, right
            ["get_sonar",""],
            ["sonar","i"],
            ["sonar_angle","i"],
            ["line_tracker","iiii"],
            ["ir_in","f"],
            ["error","s"]]

# Initialize the messenger
c = PyCmdMessenger.CmdMessenger(myarduino,commands)

# Send motor commands
c.send("motors",150,10,10)

# Get sonar reading
c.send("get_sonar")
msg = c.receive()
temp = msg[1][0] * 2
print(msg[1],temp)
