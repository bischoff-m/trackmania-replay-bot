from dataclasses import dataclass
from typing import Callable, Dict

from api import Bob, LocateImageException
from pynput.keyboard import Key


@dataclass
class Step:
    """
    This represents a single step like clicking a button or entering text.

    title:
      Title shown in the UI when this step is active.
    description:
      Description shown in the UI when this step is active.
    actions:
      A dictionary of actions that can be executed in this step. Each is shown
      as a button in the UI with the key as the button text. When the button is
      clicked, the value is executed, which should return the next step.
    """

    title: str
    description: str
    actions: Dict[str, Callable[[], "Step"]]


# Decorator that sets the title, description and buttons of a step.
def stepmethod(title: str = None, description: str = None):
    def decorator(func):
        def wrapper():
            return Step(
                title=title or func.__name__,
                description=description or "",
                actions={"Step": func},
            )

        return staticmethod(wrapper)

    return decorator


class Controller:
    @staticmethod
    def state_end():
        return Step(
            title="Done",
            description="",
            actions={
                "Again": Controller.step1,
            },
        )

    @staticmethod
    def state_error(msg: str):
        return Step(
            title="Error",
            description=msg.replace("\n", "<br>"),
            actions={
                "Again": Controller.step1,
            },
        )

    @stepmethod(title="Step 1", description="Description 1")
    def step1():
        try:
            Bob().clickImage("MenuCreateButton.png")
        except LocateImageException:
            Bob().tap(Key.up).wait(0.3).clickImage("MenuCreateButton.png")

        return Controller.step2()

    @stepmethod(title="Step 2", description="Description 2")
    def step2():
        Bob().clickImage("MenuReplayEditorButton.png")
        return Controller.state_end()
