from typing import Callable

from api import Bob, LocateImageException
from classes import Step


class ControlFlowException(Exception):
    def __str__(self):
        return (
            f"There was a general problem with controlling Trackmania: {self.args[0]}"
        )


# Decorator that sets the title, description and buttons of a step
def stepmethod(description: str = "No description provided."):
    def decorator(func: Callable[[], Step | None]):
        def wrapper():
            return Step(
                description=description,
                run=func,
            )

        return staticmethod(wrapper)

    return decorator


class Steps:
    @staticmethod
    def get_entry() -> Step:
        return Steps.step_menu_create()

    @stepmethod(description='Trying to click the "CREATE" button in the main menu.')
    def step_menu_create():
        Bob().clickImage(
            "Menu_CreateButton.png", retry="Menu_CreateButton_Hover.png"
        ).wait(0.2)
        return Steps.step_menu_replayeditor()

    @stepmethod(
        description='Trying to click the "REPLAY EDITOR" button at Create > Replay Editor from the menu.'
    )
    def step_menu_replayeditor():
        Bob().clickImage(
            "Menu_ReplayEditorButton.png", retry="Menu_ReplayEditorButton_Hover.png"
        ).wait(0.2)
        return Steps.step_replaypicker_up()

    @stepmethod(
        description="Trying to click the up button in the replay picker (if needed) to reach the root folder."
    )
    def step_replaypicker_up():
        # Check if we are already at the root folder
        found = Bob().findImage("ReplayPicker_EmptyPath.png") is not None

        # Press up button multiple times to get to the top
        for _ in range(10):
            if found:
                break
            Bob().clickImage(
                "ReplayPicker_UpButton.png", retry="ReplayPicker_UpButton_Hover.png"
            )
            found = Bob().findImage("ReplayPicker_EmptyPath.png") is not None

        if not found:
            raise ControlFlowException(
                "Could not direct the replay picker to the root folder."
            )
        return Steps.step_replaypicker_sort()

    @stepmethod(description="Trying to activate tree view, sort by name and ascending.")
    def step_replaypicker_sort():
        # Activate tree view if not already active
        if Bob().findImage("ReplayPicker_ListView.png") is not None:
            Bob().clickImage("ReplayPicker_ListView.png")
        if Bob().findImage("ReplayPicker_TreeView.png") is None:
            raise LocateImageException(
                "ReplayPicker_ListView.png or ReplayPicker_TreeView.png"
            )

        # Sort by name if not already sorted by name
        if Bob().findImage("ReplayPicker_SortByTime.png") is not None:
            Bob().clickImage("ReplayPicker_SortByTime.png")
        if Bob().findImage("ReplayPicker_SortByName.png") is None:
            raise LocateImageException(
                "ReplayPicker_SortByTime.png or ReplayPicker_SortByName.png"
            )

        # Sort ascending if not already sorted ascending
        if Bob().findImage("ReplayPicker_SortDescending.png") is not None:
            Bob().clickImage("ReplayPicker_SortDescending.png")
        if Bob().findImage("ReplayPicker_SortAscending.png") is None:
            raise LocateImageException(
                "ReplayPicker_SortDescending.png or ReplayPicker_SortAscending.png"
            )

        return Steps.step_replaypicker_folder()

    @stepmethod(
        description="Trying to click the folder where this script saves the current replay and select it."
    )
    def step_replaypicker_folder():
        Bob().clickText("!!! trackmania-replay-bot").wait(0.2)
        Bob().clickText("ycnzzu02e5")
        return Steps.step_replaypicker_confirm()

    @stepmethod(
        description='Trying to click the "CONFIRM" button, click the "EDIT" button and wait for the replay editor to load.'
    )
    def step_replaypicker_confirm():
        Bob().clickImage(
            "ReplayPicker_ConfirmButton.png",
            retry="ReplayPicker_ConfirmButton_Hover.png",
        ).wait(0.2)
        Bob().clickImage(
            "ReplayPicker_EditButton.png",
            retry="ReplayPicker_EditButton_Hover.png",
        ).wait(0.2)

        Bob().waitText("Player camera", timeout=5)

        # Done
        return None
