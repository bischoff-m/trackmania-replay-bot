import sys
from pathlib import Path
from typing import Callable

from PySide6.QtCore import Qt, QThreadPool
from PySide6.QtWidgets import (
    QApplication,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QPushButton,
    QSizePolicy,
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
        self.update(Controller.state_start())

        self.setWindowTitle("Trackmania Replay Bot")
        self.setWindowFlags(Qt.WindowStaysOnTopHint)
        # Load stylesheet
        with open(Path(__file__).parent / "stylesheet.qss") as f:
            self.setStyleSheet(f.read())
        self.show()

    def update(self, next_step: Step | None):
        if next_step is None:
            self.close()
            return
        self.step = next_step
        self.updateUI()

    def updateUI(self):
        widget = QWidget()
        self.setCentralWidget(widget)
        main_layout = QVBoxLayout(widget)

        # Add title
        main_layout.addWidget(
            QLabel(self.step.title, objectName="title"),
            alignment=Qt.AlignmentFlag.AlignTop,
        )

        # Add description
        label_desc = QLabel(self.step.description, objectName="description")
        label_desc.setWordWrap(True)
        # This prevents the content from being clipped by resizing the window.
        label_desc.setSizePolicy(
            QSizePolicy.Policy.MinimumExpanding, QSizePolicy.Policy.MinimumExpanding
        )
        main_layout.addWidget(
            label_desc,
            stretch=1,
            alignment=Qt.AlignmentFlag.AlignTop,
        )

        btn_layout = QHBoxLayout(alignment=Qt.AlignmentFlag.AlignRight)

        # When the button is clicked, the action is executed in a worker thread.
        def get_button_callback(action: Callable[[], Step]):
            def callback():
                worker = Worker(action)
                worker.signals.done.connect(self.update)
                worker.signals.error.connect(
                    lambda err: self.update(Controller.state_error(err, self.step))
                )
                self.threadpool.start(worker)

            return callback

        # Add button for each button handler
        for btn_info in self.step.buttons:
            button = QPushButton(text=btn_info.name, objectName=btn_info.style)
            button.clicked.connect(get_button_callback(btn_info.action))
            btn_layout.addWidget(button, alignment=Qt.AlignmentFlag.AlignRight)

        main_layout.addLayout(btn_layout)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    main_window = MainWindow()
    app.exec()
