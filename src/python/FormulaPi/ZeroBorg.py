# This library interfaces with the l298n motor controller shield for the Arduino, which is provided in the Elegoo Robot Car kit (and many others)

import PyCmdMessenger

left = 0
right = 0
speed = 0

MIN_THROTTLE = 0
MAX_THROTTLE = 255

commands = [["motors","iii"], # motor power, left, right
            ["get_sonar",""],
            ["sonar","i"],
            ["sonar_angle","i"],
            ["line_tracker","iiii"],
            ["ir_in","f"],
            ["error","s"]]

# Initialize an ArduinoBoard instance.  This is where you specify baud rate and
# serial timeout.  If you are using a non ATmega328 board, you might also need
# to set the data sizes (bytes for integers, longs, floats, and doubles).  
arduino = PyCmdMessenger.ArduinoBoard("/dev/ttyACM0",baud_rate=9600)

# Initialize the messenger
c = PyCmdMessenger.CmdMessenger(arduino,commands)

def InitOutChannel(channel):
  ch = 1
  return ch

class ZeroBorg:

  def Init(self):
    self.foundChip = True
    return


  def SetEpoIgnore(self, flag):
    return

  def SetCommsFailsafe(self, flag):
    return

  def ResetEpo(self):
    return

  def SetLed(self, turn_on):   # not used
    self.led.setColor('Green' if turn_on else 'Black')

  def GetThrottle(self):
    return 100

  def MotorPower(self, power):
    speed = power
    c.send("motors",speed,left,right)
    return 100

  def SetMotor1(self, power):
    left = power
    c.send("motors",speed,left,right)
 
  def SetMotor2(self, power):
    right = power
    c.send("motors",speed,left,right)

  def SetMotor3(self, power):  # ignored, since we're driving motors in pairs
    return

  def SetMotor4(self, power): # ignored
    return

  def MotorsOff(self):
    c.send("motors",0,0,0)
