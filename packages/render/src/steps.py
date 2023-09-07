from typing import Callable

from api import Bob, LocateImageException
from classes import Step
from pynput.keyboard import Key


class ControlFlowException(Exception):
    def __str__(self):
        return (
            f"There was a general problem with controlling Trackmania: {self.args[0]}"
        )


def no_whitespace(text: str) -> str:
    return " ".join(text.split())


# Decorator that transforms a function into a method that returns a Step object
# with the description and the function to run for that step.
def stepmethod(description: str = "No description provided."):
    def decorator(step_func: Callable[..., Step | None]):
        def wrapper(*args, **kwargs):
            def run_step():
                get_next = step_func(*args, **kwargs)
                return get_next and get_next()

            return Step(
                description=description,
                run=run_step,
            )

        return wrapper

    return decorator


def steps_entry() -> Step | None:
    ############################################################################
    ############################################################################
    # Start MediaTracker Group
    ############################################################################

    @stepmethod(
        description=no_whitespace(
            """
                This groups the following steps:
                <ul>
                    <li>Menu > Create > Replay Editor</li>
                    <li>Select the replay</li>
                    <li>Start the MediaTracker</li>
                </ul>
            """
        )
    )
    def group_start_mediatracker():
        ########################################################################
        @stepmethod(description='Trying to click the "CREATE" button in the main menu.')
        def step_menu_create():
            Bob().clickImage(
                "Menu_CreateButton.png", retry="Menu_CreateButton_Hover.png"
            ).wait(0.2)
            return step_menu_replayeditor

        ########################################################################
        @stepmethod(
            description='Trying to click the "REPLAY EDITOR" button at Create > Replay Editor from the menu.'
        )
        def step_menu_replayeditor():
            Bob().clickImage(
                "Menu_ReplayEditorButton.png", retry="Menu_ReplayEditorButton_Hover.png"
            ).wait(0.2)
            return step_replaypicker_up

        ########################################################################
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
            return step_replaypicker_sort

        ########################################################################
        @stepmethod(
            description="Trying to activate tree view, sort by name and ascending."
        )
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

            return step_replaypicker_folder

        ########################################################################
        @stepmethod(
            description="Trying to click the folder where this script saves the current replay and select it."
        )
        def step_replaypicker_folder():
            Bob().clickText("!!! trackmania-replay-bot").wait(0.2)
            Bob().clickText("ycnzzu02e5")
            return step_replaypicker_confirm

        ########################################################################
        @stepmethod(
            description='Trying to click the "CONFIRM" button, click the "EDIT" button and wait for the MediaTracker to load.'
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

            return group_render

        return step_menu_create

    ############################################################################
    ############################################################################
    # Render Group
    ############################################################################

    @stepmethod(
        description=no_whitespace(
            """
                This groups the following steps:
                <ul>
                    <li>Import ghost to render</li>
                    <li>Remove old ghost</li>
                    <li>Adjust camera track length to match ghost length</li>
                    <li>Open render dialog</li>
                </ul>
            """
        )
    )
    def group_render():
        ########################################################################
        @stepmethod(
            description=no_whitespace(
                'Trying to click the "Import ghosts..." button, select the \
                folder where this script saves the current ghost and select it.'
            )
        )
        def step_mediatracker_addghost():
            Bob().clickImage("MediaTracker_Import_Button.png")
            Bob().clickText("!!! trackmania-replay-bot")
            Bob().clickText("ycnzzu02e5.Ghost.Gbx")
            Bob().clickImage(
                "MediaTracker_Import_Open.png",
                retry="MediaTracker_Import_Open_Hover.png",
            ).wait(0.2)

            return step_mediatracker_removeghost

        ########################################################################
        @stepmethod(
            description=no_whitespace(
                "Trying to remove the old ghost. Requires the game to be focused."
            )
        )
        def step_mediatracker_removeghost():
            Bob().tap(Key.down, modifiers=[Key.shift])
            Bob().tap(Key.down, modifiers=[Key.shift])
            Bob().clickImage("MediaTracker_DeleteBlock.png").wait(0.1)
            Bob().tap(Key.enter).wait(0.1)

            return step_mediatracker_copylength

        ########################################################################
        @stepmethod(
            description=no_whitespace(
                "Trying to copy the ghost length into clipboard. Requires the \
                game to be focused."
            )
        )
        def step_mediatracker_copylength():
            Bob().tap(Key.up, modifiers=[Key.shift])
            Bob().tap(Key.down, modifiers=[Key.shift])
            Bob().clickRelative(2470 / 2560, 1184 / 1440).wait(0.1)
            Bob().tap("a", modifiers=[Key.ctrl])
            Bob().tap("c", modifiers=[Key.ctrl])
            Bob().tap(Key.esc)

            return step_mediatracker_pastelength

        ########################################################################
        @stepmethod(
            description="Trying to select camera track and go to timestamp that was copied before. Requires the game to be focused."
        )
        def step_mediatracker_pastelength():
            Bob().tap(Key.up, modifiers=[Key.shift])
            Bob().clickRelative(920 / 2560, 1100 / 1440).wait(0.1)
            Bob().tap("a", modifiers=[Key.ctrl])
            Bob().tap("v", modifiers=[Key.ctrl])
            Bob().tap(Key.enter)

            return step_mediatracker_fitcamera

        ########################################################################
        @stepmethod(
            description="Trying to select camera track and go to timestamp that was copied before. Requires the game to be focused."
        )
        def step_mediatracker_fitcamera():
            Bob().tap("l")
            Bob().clickImage("MediaTracker_DeleteBlock.png").wait(0.1)
            Bob().tap(Key.enter).wait(0.1)

            return step_mediatracker_openrender

        ########################################################################
        @stepmethod(
            description="Trying to select camera track and go to timestamp that was copied before. Requires the game to be focused."
        )
        def step_mediatracker_openrender():
            Bob().wait(3)
            Bob().clickImage("MediaTracker_Render_Button.png").wait(0.1)
            Bob().clickImage(
                "MediaTracker_Render_Confirm.png",
                retry="MediaTracker_Render_Confirm_Hover.png",
            ).wait(0.1)

            # Wait for render to finish
            Bob().waitText("Player camera", timeout=60 * 60 * 24)

            # Done
            return None

        return step_mediatracker_addghost

        ########################################################################

    return group_start_mediatracker()

    ############################################################################
    ############################################################################
