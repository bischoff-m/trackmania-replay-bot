import traceback
from typing import Callable

from classes import Step
from PySide6.QtCore import QObject, QRunnable, Signal, Slot


class WorkerSignals(QObject):
    """
    Defines the signals available from a running worker thread.

    Supported signals are:

    done
        step - The next step to transition to.

    error
        str - Error message to display.

    """

    done = Signal(Step)
    error = Signal(Exception, str)


class Worker(QRunnable):
    """
    Worker thread

    Inherits from QRunnable to handler worker thread setup, signals and wrap-up.

    :param action: The function callback to run on this worker thread.
    """

    def __init__(self, action: Callable[[], Step]):
        super(Worker, self).__init__()

        self.action = action
        self.signals = WorkerSignals()

    @Slot()
    def run(self):
        """
        Initialise the runner function and emit signals.
        """
        try:
            next_step = self.action()
            self.signals.done.emit(next_step)
        except Exception as e:
            trace = traceback.format_exc()
            self.signals.error.emit(e, trace)
