# FormulaPi3

This is a modification of FormulaPi with three big changes:

1) Designed to run on a RaspberryP 3, using the full power of that board

2) Rather than using the standard ZeroBorg motor driver, it it uses the RaspiRobot motor driver, which is better for the RaspberryPi 3: https://www.adafruit.com/product/1940

3) Uses OpenCV3.x

To install OpenCV3 on your RasperryPi, use this script:
https://gist.github.com/willprice/c216fcbeba8d14ad1138

This is still designed to use Python 2.7, but it can easily be updated to Python 3.6 using the Python 2to3 script

# Race Code

Here you will find more detail on our standard Race Code and how you can use it to win races :)

The standard Race Code is split into several parts:

Race Code Instructions (Race.py)

Think of this script as the instructions you are giving your "virtual driver" for how to win the race.
Every team will want to change this script to control how their YetiBorg tries to race around the track.
Uses the Race Code Functions provided by Formula.py to control the behaviour of the YetiBorg

Race Code Functions (RaceCodeFunctions.py)

These functions allow you to know what is going on around you and change how the YetiBorg is driving.
The functions are made available to Race.py so it can make decisions and alter strategy during a race.

Race Code Settings (Settings.py)

In this script are the settings used by the processing inside Formula.py.
Changes here can be used to fine-tune how the camera processing and track following work.

Race Code Processing (ImageProcessor.py)

This script takes the camera images and provides the ability to control the YetiBorg around the track.
It provides the data and inputs for the Race Code Functions used by Race.py

Main script (Formula.py)

This script is responsible for keeping everything running.
It manages the threads used by the other scripts, sets the output for the motors, and sets up the camera.

Control Script (ZeroBorg.py)

This is the script which talks to the ZeroBorg to control motor speeds.
The script is called from Formula.py for each camera frame to update the motors to new settings.

Global values (Globals.py)

This is the script simply holds the values, images, functions, et cetera which are shared by the scripts above.
These values change while the scripts are running and they control a fair amount of the processing logic.

All of these scripts can be altered or replaced for a race, but you can win by simply improving Race.py to drive a better line around the track.
Control can be as simple as changing lanes at points along the track, or advanced enough to look at camera images and make intelligent decisions based on the robots in front.

Finally there are some Simulation*.py scripts as well.
These take the place of Formula.py to allow a race to be simulated without the need of a track or YetiBorg.
Each simulation is slightly different, but they should help with testing your own code or improving on ours.

For more detail on how everything works click on the pages below to find out how each of the bits work.
