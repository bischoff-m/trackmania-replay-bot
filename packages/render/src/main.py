import sys
from typing import Callable

from PySide6.QtCore import Qt, QThreadPool
from PySide6.QtWidgets import (
    QApplication,
    QLabel,
    QMainWindow,
    QPushButton,
    QVBoxLayout,
    QWidget,
)
from steps import Controller, Step
from worker import Worker


# Subclass QMainWindow to customize your application's main window
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.threadpool = QThreadPool()
        self.update(Controller.step1())

        self.setWindowTitle("Trackmania Replay Bot")
        self.setWindowFlags(Qt.WindowStaysOnTopHint)
        self.show()

    def update(self, next_step: Step):
        if next_step is None:
            self.close()
            return
        self.step = next_step

        widget = QWidget()
        self.setCentralWidget(widget)
        layout = QVBoxLayout(widget)

        layout.addWidget(
            QLabel(self.step.title), alignment=Qt.AlignmentFlag.AlignCenter
        )
        layout.addWidget(
            QLabel(self.step.description), alignment=Qt.AlignmentFlag.AlignCenter
        )

        # When the button is clicked, the action is executed in a worker thread.
        def onButtonClick(action: Callable[[], Step]):
            worker = Worker(action)
            worker.signals.done.connect(self.update)
            worker.signals.error.connect(
                lambda msg: self.update(Controller.state_error(msg))
            )
            self.threadpool.start(worker)

        # Add QPushButtons for each action.
        for action_name, action in self.step.actions.items():
            button = QPushButton(text=action_name)
            button.clicked.connect(lambda: onButtonClick(action))
            layout.addWidget(button, alignment=Qt.AlignmentFlag.AlignCenter)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    main_window = MainWindow()
    app.exec()
