from pathlib import Path

from classes import State

# from control import Control
from PySide6.QtCore import Qt, QThreadPool
from PySide6.QtWidgets import (
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QPushButton,
    QSizePolicy,
    QVBoxLayout,
    QWidget,
)
from worker import Worker


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.threadpool = QThreadPool()

        self.setWindowTitle("Trackmania Replay Bot")
        self.setWindowFlags(Qt.WindowStaysOnTopHint)
        # Load stylesheet
        with open(Path(__file__).parent / "stylesheet.qss") as f:
            self.setStyleSheet(f.read())

        self.show()

    def start_worker(self, worker: Worker):
        self.threadpool.start(worker)

    def update(
        self,
        new_state: State | None = None,
        loading: bool = False,
    ):
        if new_state is None:
            self.close()
            return

        widget = QWidget()
        self.setCentralWidget(widget)
        main_layout = QVBoxLayout(widget)

        # Add title
        main_layout.addWidget(
            QLabel(new_state.title, objectName="title"),
            alignment=Qt.AlignmentFlag.AlignTop,
        )

        # Add description
        label_desc = QLabel(new_state.description, objectName="description")
        label_desc.setWordWrap(new_state.word_wrap)
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

        if loading:
            btn_layout.addWidget(
                QLabel("Loading..."), alignment=Qt.AlignmentFlag.AlignRight
            )

        # Add button for each button handler
        for btn_info in new_state.buttons:
            object_name = "disabled" if loading else btn_info.style
            button = QPushButton(text=btn_info.name, objectName=object_name)
            button.clicked.connect(btn_info.action)
            button.setEnabled(not loading)
            btn_layout.addWidget(button, alignment=Qt.AlignmentFlag.AlignRight)

        main_layout.addLayout(btn_layout)
