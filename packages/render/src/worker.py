import traceback
from typing import Callable

from PySide6.QtCore import QObject, QRunnable, Signal, Slot
from states import State


class WorkerSignals(QObject):
    """
    Defines the signals available from a running worker thread.

    Supported signals are:

    done
        state - The next state to transition to.

    error
        str - Error message to display.

    """

    done = Signal(State)
    error = Signal(Exception)


class Worker(QRunnable):
    """
    Worker thread

    Inherits from QRunnable to handler worker thread setup, signals and wrap-up.

    :param action: The function callback to run on this worker thread.
    """

    def __init__(self, action: Callable[[], State]):
        super(Worker, self).__init__()

        self.action = action
        self.signals = WorkerSignals()

    @Slot()
    def run(self):
        """
        Initialise the runner function and emit signals.
        """
        try:
            next_state = self.action()
            self.signals.done.emit(next_state)
        except Exception as e:
            traceback.print_exc()
            self.signals.error.emit(e)
