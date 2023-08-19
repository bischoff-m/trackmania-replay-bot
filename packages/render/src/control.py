from typing import Callable, List

from classes import Button, State, Step
from pynput import mouse
from steps import Steps
from worker import Worker


def no_whitespace(text: str) -> str:
    return " ".join(text.split())


class Control:
    def __init__(
        self,
        on_state_change: Callable[[State, bool], None] | None = None,
        start_worker: Callable[[Worker], None] | None = None,
    ):
        self.on_state_change = on_state_change or (lambda *_: None)
        self.start_worker = start_worker

        self._state = None
        self._is_worker_running = False
        self._current_step: Step | None = None
        self._step_history: List[Step] = []
        self.state_initial()

    def connect(
        self,
        on_state_change: Callable[[State, bool], None],
        start_worker: Callable[[Worker], None],
    ):
        self.on_state_change = on_state_change
        self.start_worker = start_worker
        on_state_change(self._state, self._is_worker_running)

    def run_silent(self) -> bool:
        """Run the bot without showing the GUI."""

        listener = mouse.Listener(on_scroll=lambda *_: False)
        listener.start()
        listener.wait()
        step = Steps.get_entry()
        try:
            while step is not None:
                self._step_history.append(step)
                if not listener.running:
                    raise Exception("Stopped by user")
                step = step.run()
        except Exception as err:
            self.state_error(err)
            return False

        self.state_quit()
        return True

    def set_state(self, new_state: State | None, loading: bool = False):
        self._state = new_state
        self._is_worker_running = loading
        self.on_state_change(new_state, loading)

    def step_forward(self):
        if self._is_worker_running:
            raise RuntimeError("Worker is already running. This should not happen.")
        if self._current_step is None:
            self.state_step(Steps.get_entry())
            return

        worker = Worker(self._current_step.run)
        worker.signals.done.connect(self.state_step)
        worker.signals.error.connect(self.state_error)

        self.set_state(self._state, True)
        self.start_worker(worker)

    def step_backward(self):
        print("Step backward")
        print(self._step_history)
        print(self._current_step)
        self._current_step = None
        if self._step_history:
            self.state_step(self._step_history.pop())
        else:
            self.state_initial()

    def state_step(self, new_step: Step):
        if new_step is None:
            self.state_end()
            return

        if self._current_step is not None:
            self._step_history.append(self._current_step)
        self._current_step = new_step

        self.set_state(
            State(
                title="Step by Step Helper",
                description=self._current_step.description
                or "No description provided.",
                buttons=[
                    Button(
                        name="Cancel",
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
                        name="Next",
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
        self._current_step = None
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
                        # TODO: Implement this
                        name="Run All",
                        action=self.step_forward,
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
        print("Error")
        print("Current step:", self._current_step)
        print("Step history:", self._step_history)
        if self._current_step is not None:
            self._step_history.append(self._current_step)
            self._current_step = None
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
