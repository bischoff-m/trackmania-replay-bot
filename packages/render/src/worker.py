import traceback
from typing import Callable

from PySide6.QtCore import QObject, QRunnable, Signal, Slot
from steps import Step


class WorkerSignals(QObject):
    """
    Defines the signals available from a running worker thread.

    Supported signals are:

    done
        step - Object of type Step

    error
        str - error message

    """

    done = Signal(Step)
    error = Signal(Exception)


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
            traceback.print_exc()
            self.signals.error.emit(e)
