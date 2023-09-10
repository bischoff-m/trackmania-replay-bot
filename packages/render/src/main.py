import sys

from control import Control

if __name__ == "__main__":
    silent = "--silent" in sys.argv
    silent = True

    control = Control()
    if silent:
        control.run_silent()
    else:
        control.init_window()
