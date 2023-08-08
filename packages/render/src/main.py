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
from states import Controller, State
from worker import Worker


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.threadpool = QThreadPool()
        self.is_worker_running = False

        self.update(Controller.state_start())

        self.setWindowTitle("Trackmania Replay Bot")
        self.setWindowFlags(Qt.WindowStaysOnTopHint)
        # Load stylesheet
        with open(Path(__file__).parent / "stylesheet.qss") as f:
            self.setStyleSheet(f.read())
        self.show()

    def update(self, next_state: State | None):
        if next_state is None:
            self.close()
            return
        self.state = next_state
        self.updateUI()

    def updateUI(self):
        widget = QWidget()
        self.setCentralWidget(widget)
        main_layout = QVBoxLayout(widget)

        # Add title
        main_layout.addWidget(
            QLabel(self.state.title, objectName="title"),
            alignment=Qt.AlignmentFlag.AlignTop,
        )

        # Add description
        label_desc = QLabel(self.state.description, objectName="description")
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
        def get_button_callback(action: Callable[[], State]):
            def on_done(next_state: State):
                self.is_worker_running = False
                self.update(next_state)

            def on_error(err: Exception):
                self.is_worker_running = False
                self.update(Controller.state_error(err, self.state))

            def callback():
                if self.is_worker_running:
                    raise RuntimeError(
                        "Worker is already running. This should not happen."
                    )
                worker = Worker(action)
                worker.signals.done.connect(on_done)
                worker.signals.error.connect(on_error)

                self.is_worker_running = True
                self.updateUI()
                self.threadpool.start(worker)

            return callback

        if self.is_worker_running:
            btn_layout.addWidget(
                QLabel("Loading..."), alignment=Qt.AlignmentFlag.AlignRight
            )

        # Add button for each button handler
        for btn_info in self.state.buttons:
            style = "disabled" if self.is_worker_running else btn_info.style
            button = QPushButton(text=btn_info.name, objectName=style)
            button.setEnabled(not self.is_worker_running)
            button.clicked.connect(get_button_callback(btn_info.action))
            btn_layout.addWidget(button, alignment=Qt.AlignmentFlag.AlignRight)

        main_layout.addLayout(btn_layout)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    main_window = MainWindow()
    app.exec()
