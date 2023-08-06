import json
from dataclasses import dataclass
from typing import Callable, List, Literal, Optional

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
    action: Callable[[], "Step"]
    style: Optional[Literal["confirm", "cancel"]] = None


# Decorator that sets the title, description and buttons of a step.
def stepmethod(description: str = None):
    def decorator(func: Callable[[], Step]):
        def wrapper():
            return Step(
                title="Step",
                description=description or "",
                buttons=[
                    Button(
                        name="Cancel",
                        action=Controller.state_quit,
                        style="cancel",
                    ),
                    Button(
                        name="Step",
                        action=func,
                        style="confirm",
                    ),
                ],
            )

        return staticmethod(wrapper)

    return decorator


def no_whitespace(text: str) -> str:
    return " ".join(text.split())


class Controller:
    @staticmethod
    def state_quit():
        # This closes the application.
        return None

    @staticmethod
    def state_start():
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
                <li>Optional: HDR disabled (not tested with HDR)</li>
            </ul>
            """
        )
        return Step(
            title="Step by Step Helper",
            description=description,
            buttons=[
                Button(
                    name="Quit",
                    action=Controller.state_quit,
                    style="cancel",
                ),
                Button(
                    # TODO: Implement this.
                    name="Run All",
                    action=Controller.step_menu_create,
                ),
                Button(
                    name="Step by Step",
                    action=Controller.step_replaypicker_up,
                    style="confirm",
                ),
            ],
        )

    @staticmethod
    def state_end():
        return Step(
            title="Done",
            description="The script has finished. You can now close this window.",
            buttons=[
                Button(
                    name="Again",
                    action=Controller.state_start,
                ),
                Button(
                    name="Quit",
                    action=Controller.state_quit,
                    style="confirm",
                ),
            ],
        )

    @staticmethod
    def state_error(err: Exception, from_step: Step = None):
        buttons = [
            Button(
                name="Cancel",
                action=Controller.state_quit,
                style="cancel",
            ),
            Button(
                name="Back to Start",
                action=Controller.state_start,
            ),
        ]
        if from_step is not None:
            buttons.append(
                Button(
                    name="Retry",
                    action=lambda: from_step,
                    style="confirm",
                ),
            )
        return Step(
            title="Error",
            description=str(err).replace("\n", "<br>"),
            buttons=buttons,
        )

    @stepmethod(description='Trying to click the "CREATE" button in the main menu.')
    def step_menu_create():
        Bob().clickImage(
            "Menu_CreateButton.png", retry="Menu_CreateButton_Hover.png"
        ).wait(0.2)
        return Controller.step_menu_replayeditor()

    @stepmethod(
        description='Trying to click the "REPLAY EDITOR" button at Create > Replay Editor from the menu.'
    )
    def step_menu_replayeditor():
        Bob().clickImage(
            "Menu_ReplayEditorButton.png", retry="Menu_ReplayEditorButton_Hover.png"
        ).wait(0.2)
        return Controller.state_end()

    @stepmethod(
        description="Trying to click the up button in the replay picker (if needed) to reach the root folder."
    )
    def step_replaypicker_up():
        # Check if we are already at the root folder.
        found = Bob().findImage("ReplayPicker_EmptyPath.png") is not None

        # Press up button multiple times to get to the top.
        for _ in range(10):
            if found:
                break
            Bob().clickImage(
                "ReplayPicker_UpButton.png", retry="ReplayPicker_UpButton_Hover.png"
            )
            found = Bob().findImage("ReplayPicker_EmptyPath.png") is not None

        if not found:
            raise Exception("Could not direct the replay picker to the root folder.")
        return Controller.state_end()

    @stepmethod(description="Testing")
    def step_testing():
        test = {
            "ListView": Bob().findImage("ReplayPicker_ListView.png"),
            "TreeView": Bob().findImage("ReplayPicker_TreeView.png"),
            "SortAscending": Bob().findImage("ReplayPicker_SortAscending.png"),
            "SortDescending": Bob().findImage("ReplayPicker_SortDescending.png"),
            "SortByTime": Bob().findImage("ReplayPicker_SortByTime.png"),
            "SortByName": Bob().findImage("ReplayPicker_SortByName.png"),
            "UpButton": Bob().findImage("ReplayPicker_UpButton.png"),
        }
        print(json.dumps(test, indent=4))
        return Controller.state_end()
