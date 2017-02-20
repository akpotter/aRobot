#!/usr/bin/env python
import time
import subprocess
from sense_hat import SenseHat

sense = SenseHat()
sense.set_rotation(270)

def main():
    # Get the current SSID
    SSID = None
    try:
        SSID = subprocess.check_output(["iwgetid", "-r"]).strip()
    except subprocess.CalledProcessError:
        # If there is no connection subprocess throws a 'CalledProcessError'
        pass

    # Show status on the LCD display
    if SSID is None:
        sense.show_letter("x", text_colour=[255, 0, 0])
    else:
        sense.show_letter("o", text_colour=[0, 255, 0])

if __name__ == "__main__":
    main()
