import sys

from control import Control

if __name__ == "__main__":
    silent = "--silent" in sys.argv
    silent = True

    control = Control()
    success = control.run_silent() if silent else False

    if not success:
        control.init_window()
