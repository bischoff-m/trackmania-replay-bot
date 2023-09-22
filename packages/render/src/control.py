import sys
import traceback
from typing import Generator, List, Optional

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

        # If the step is not None, the program is in the "step" state.
        self._step: Step | None = None
        self._step_history: List[Step] = []

        # If the step generator is None, the program is done.
        self._step_generator: Generator[Step] | None = steps_entry()

        self.state_initial()

    def run_window(self):
        if self._window is not None:
            raise RuntimeError("Window already initialized.")
        app = QApplication(sys.argv)
        self._window = MainWindow()
        self._window.update(self._state, self._is_worker_running)
        app.exec()

    def show_window(self):
        if self._window is None:
            raise RuntimeError("Window not initialized.")
        self._window.setUpdatesEnabled(True)
        self._window.update(self._state, self._is_worker_running)
        self._window.show()

    def hide_window(self):
        if self._window is None:
            raise RuntimeError("Window not initialized.")
        self._window.hide()
        self._window.setUpdatesEnabled(False)

    def set_state(self, new_state: State | None, loading: bool = False):
        self._state = new_state
        self._is_worker_running = loading
        if self._window is not None:
            # Closes the window if new_state is None
            self._window.update(new_state, loading)

    def next_generated_step(self) -> Step | None:
        if self._step_generator is None:
            raise RuntimeError("Program already finished.")

        try:
            next_step = next(self._step_generator)
        except StopIteration:
            next_step = None

        self._step_history = []
        if next_step is None:
            self._step_generator = None
        return next_step

    def run_silent(self, limit: int = 0):
        """Run the bot without showing the GUI.

        Parameters
        ----------
        limit : int, optional
            After how many steps to stop, by default 0 (run until _step.run()
            returns None)

        Returns
        -------
        bool
            True if the program finished successfully, False if the run_window()
            method should be called. This is not done by this method itself
            because it halts the execution.
        """
        if self._step_generator is None:
            return

        if self._window is not None:
            self.hide_window()

        # Stop the program when the user scrolls the mouse wheel
        listener = mouse.Listener(on_scroll=lambda *_: False)
        listener.start()
        listener.wait()

        if self._step is None:
            self.state_step(None)

        i = 0
        try:
            while self._step is not None and (limit == 0 or i < limit):
                if not listener.running:
                    raise Exception("Stopped by user")

                next_step = self._step.run()
                self.state_step(next_step)
                i += 1
        except Exception as err:
            self.state_error(err)
            if self._window is None:
                return False
            else:
                self.show_window()
                return True
        finally:
            listener.stop()

        # Program finished successfully

        if self._window is not None:
            if self._step is None and limit == 0:
                # If end state is reached and no limit was set
                self.state_quit()
            else:
                self.show_window()

        return True

    def step_forward(self):
        if self._is_worker_running:
            raise RuntimeError(
                "Worker is already running. This should be prevented by disabling the buttons."
            )
        if self._step_generator is None:
            raise RuntimeError("Program already finished.")

        if self._step is None:
            self.state_step(None)
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
        if self._step_history:
            self._step = None
            self.state_step(self._step_history.pop())
        else:
            self.state_initial()

    ############################################################################
    # States
    ############################################################################

    def state_step(self, new_step: Step | None):
        if self._step is not None:
            self._step_history.append(self._step)

        self._step = new_step

        if self._step is None:
            if (
                self._step_generator is not None
                and (step := self.next_generated_step()) is not None
            ):
                self._step = step
            else:
                if self._window is None:
                    self.state_quit()
                else:
                    self.state_end()
                return

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
        self._step_generator = steps_entry()
        description = no_whitespace(
            """
            <font color="red">
                Unexpected bad things can happen if you don\'t read this!
            </font>
            <br><br>

            This will attempt to open Trackmania and set it up to render using
            simulated mouse and keyboard input. <b>Mouse click positions</b> are based on
            image recognition and relative coordinates and <b>may fail</b> if your system is
            not set up the same way as mine. If you are using this script for the
            first time, go through the steps one at a time and check that everything
            works. For now, you will have to dig into the code yourself to fix any
            problems.
            <br><br>

            <b>Checklist</b>
            <ul>
                <li>Trackmania is in "Windowed Borderless" mode</li>
                <li>Trackmania is on the main monitor (restricted by pyautogui)</li>
                <li>Nothing else is on the main monitor</li>
            </ul>

            <b>If the script fails</b>
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
                        action=self.run_silent,
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

    def state_error(self, err: Exception, trace: Optional[str] = None):
        if trace is None:
            trace = traceback.format_exc()
        print(err)
        print(trace)

        if self._step is not None:
            self._step_history.append(self._step)
            self._step = None

        msg = str(err).replace("\n", "<br>")
        body = trace.replace("\n", "<br>").replace(" ", "&nbsp;")
        description = no_whitespace(
            f"""
                {msg}<br>

                <div style="font-family: Consolas; background-color: #c5c6c6">
                    {body}
                </div>
            """
        )

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
                description=description,
                buttons=buttons,
                word_wrap=False,
            ),
        )
