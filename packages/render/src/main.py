import sys

from control import Control

if __name__ == "__main__":
    silent = "--silent" in sys.argv
    silent = True

    control = Control()
    if not (silent and control.run_silent()):
        control.run_window()
