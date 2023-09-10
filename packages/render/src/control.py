import sys
from typing import List

from api import Bob
from classes import Button, State, Step
from pynput import mouse
from pynput.keyboard import Key
from PySide6.QtWidgets import QApplication
from steps import no_whitespace, steps_entry
from window import MainWindow
from worker import Worker


class Control:
    def __init__(self):
        self._window: MainWindow | None = None
        self._state: State | None = None
        self._is_worker_running: bool = False
        self._step: Step | None = None
        self._step_history: List[Step] = []
        self.state_initial()

    def init_window(self):
        if self._window is not None:
            return
        app = QApplication(sys.argv)
        self._window = MainWindow()
        self._window.update(self._state, self._is_worker_running)
        app.exec()

    def show_window(self):
        if self._window is not None:
            self._window.setUpdatesEnabled(True)
            self._window.update(self._state, self._is_worker_running)
            self._window.show()

    def hide_window(self):
        if self._window is not None:
            self._window.hide()
            self._window.setUpdatesEnabled(False)

    def run_silent(self, iterations: int = 0):
        """Run the bot without showing the GUI.

        Parameters
        ----------
        iterations : int, optional
            How many steps to run. 0 means infinite, by default 0
        """
        self.hide_window()

        listener = mouse.Listener(on_scroll=lambda *_: False)
        listener.start()
        listener.wait()

        if self._step is None:
            self._step = steps_entry()

        i = 0
        try:
            while self._step is not None and (iterations == 0 or i < iterations):
                if not listener.running:
                    raise Exception("Stopped by user")
                prev_step = self._step
                self._step = self._step.run()
                self._step_history.append(prev_step)
                i += 1
                if i == iterations:
                    self.state_step(self._step)

            if self._step is None and iterations == 0:
                self.state_quit()
        except Exception as err:
            self.state_error(err)
            self.init_window()
        finally:
            listener.stop()
            self.show_window()

    def set_state(self, new_state: State | None, loading: bool = False):
        self._state = new_state
        self._is_worker_running = loading
        if self._window is not None:
            self._window.update(new_state, loading)

    def step_forward(self):
        if self._is_worker_running:
            raise RuntimeError("Worker is already running. This should not happen.")
        if self._step is None:
            self.state_step(steps_entry())
            return

        if self._step.needs_focus:
            Bob().wait(0.3).tap(Key.tab, modifiers=[Key.alt]).wait(0.3)

        worker = Worker(self._step.run)
        worker.signals.done.connect(self.state_step)
        worker.signals.error.connect(self.state_error)

        self.set_state(self._state, True)
        if self._window is not None:
            self._window.start_worker(worker)

    def step_backward(self):
        self._step = None
        if self._step_history:
            self.state_step(self._step_history.pop())
        else:
            self.state_initial()

    ############################################################################
    # States
    ############################################################################

    def state_step(self, new_step: Step):
        if new_step is None:
            self.state_end()
            return

        if self._step is not None:
            self._step_history.append(self._step)
        self._step = new_step

        self.set_state(
            State(
                title="Step by Step Helper",
                description=self._step.description or "No description provided.",
                buttons=[
                    Button(
                        name="Quit",
                        action=self.state_quit,
                        style="cancel",
                    ),
                    Button(
                        name="Back To Start",
                        action=self.state_initial,
                    ),
                    Button(
                        name="Back",
                        action=self.step_backward,
                    ),
                    Button(
                        name="Continue Silent",
                        action=lambda: self.run_silent(),
                    ),
                    Button(
                        name="Run",
                        action=self.step_forward,
                        style="confirm",
                    ),
                ],
            )
        )

    def state_quit(self):
        # This closes the application
        self.set_state(None)

    def state_initial(self):
        self._step = None
        self._step_history = []
        description = '<font color="red">Unexpected bad things can happen if you don\'t read this!</font><br><br>'
        description += no_whitespace(
            """
            This will attempt to open Trackmania and set it up to render using
            simulated mouse and keyboard input. <b>Mouse click positions</b> are based on
            image recognition and relative coordinates and <b>may fail</b> if your system is
            not set up the same way as mine. If you are using this script for the
            first time, go through the steps one at a time and check that everything
            works. For now, you will have to dig into the code yourself to fix any
            problems.<br><br>
            """
        )
        description += "<b>Checklist</b>"
        description += no_whitespace(
            """
            <ul>
                <li>Trackmania is in "Windowed Borderless" mode</li>
                <li>Trackmania is on the main monitor (restricted by pyautogui)</li>
                <li>Nothing else is on the main monitor</li>
            </ul>
            """
        )
        description += "<b>If the script fails</b>"
        description += no_whitespace(
            """
            <ul>
                <li>Check that Openplanet plugins are not blocking any UI elements</li>
                <li>Disable HDR (works for me but could cause problems)</li>
            </ul>
            """
        )
        self.set_state(
            State(
                title="Step by Step Helper",
                description=description,
                buttons=[
                    Button(
                        name="Quit",
                        action=self.state_quit,
                        style="cancel",
                    ),
                    Button(
                        name="Run Silent",
                        action=lambda: self.run_silent(),
                    ),
                    Button(
                        name="First Step",
                        action=self.step_forward,
                        style="confirm",
                    ),
                ],
            )
        )

    def state_end(self):
        self.set_state(
            State(
                title="Done",
                description="The script has finished. You can now close this window.",
                buttons=[
                    Button(
                        name="Again",
                        action=self.state_initial,
                    ),
                    Button(
                        name="Quit",
                        action=self.state_quit,
                        style="confirm",
                    ),
                ],
            )
        )

    def state_error(self, err: Exception):
        print(err)
        if self._step is not None:
            self._step_history.append(self._step)
            self._step = None

        buttons = [
            Button(
                name="Cancel",
                action=self.state_quit,
                style="cancel",
            ),
            Button(
                name="Back to Start",
                action=self.state_initial,
            ),
            Button(
                name="Back",
                action=self.step_backward,
                style="confirm",
            ),
        ]
        self.set_state(
            State(
                title="Error",
                description=str(err).replace("\n", "<br>"),
                buttons=buttons,
            ),
        )
