from dataclasses import dataclass
from typing import Callable, List, Literal

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
    buttons: List["Button"]


@dataclass
class Button:
    name: str
    style: Literal["confirm", "cancel", None]
    action: Callable[[], "Step"]


# Decorator that sets the title, description and buttons of a step.
def stepmethod(title: str = None, description: str = None):
    def decorator(func: Callable[[], Step]):
        def wrapper():
            return Step(
                title=title,
                description=description,
                buttons=[
                    Button(
                        name="Cancel",
                        style="cancel",
                        action=Controller.state_end,
                    ),
                    Button(
                        name="Step",
                        style="confirm",
                        action=func,
                    ),
                ],
            )

        return staticmethod(wrapper)

    return decorator


class Controller:
    @staticmethod
    def state_end():
        return Step(
            title="Done",
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit.",
            buttons=[
                Button(
                    name="Again5",
                    style="cancel",
                    action=Controller.step1,
                ),
                Button(
                    name="Again3",
                    style=None,
                    action=Controller.step1,
                ),
                Button(
                    name="Again4",
                    style="confirm",
                    action=Controller.step1,
                ),
            ],
        )

    @staticmethod
    def state_error(msg: str):
        return Step(
            title="Error",
            description=msg.replace("\n", "<br>"),
            buttons=[
                Button(
                    name="Again",
                    style="confirm",
                    action=Controller.step1,
                ),
            ],
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
