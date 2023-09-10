from typing import Callable, List

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


def bullets(
    *points: str | List[str], prefix: str = "Trying to do the following:"
) -> str:
    """Formats a list of points into a HTML list.

    Parameters
    ----------
    points : str | List[str]
        The points to be formatted. If a list is given, it is recursively
        formatted.
    prefix : str | None, optional
        The prefix to be used for each bullet point, by default None

    Returns
    -------
    str
        The formatted bullet list
    """
    to_str = lambda p: p if isinstance(p, str) else bullets(*p, prefix="")
    points = [to_str(p) for p in points]
    return f"{prefix}<ul><li>{'</li><li>'.join(points)}</li></ul>"


def stepmethod(
    html: str = "",
    run_immediately: bool = False,
    needs_focus: bool = False,
) -> Callable[..., Step | None]:
    """Decorator for step methods.

    Wraps the decorated method (step_func) into one that returns a step object.
    The decorated method is bound to the step object's "run" method and should
    return a step object that will be executed next. If it returns None, the
    execution of the step chain is stopped.

    Parameters
    ----------
    html : str, optional
        The content that is displayed in the UI for this step, by default ""
    run_immediately : bool, optional
        If True, the given step method is executed immediately and the resulting
        next step is returned instead, by default False. This is useful for
        grouping steps together.

    Returns
    -------
    Callable[..., Step | None]
        The wrapped step method
    """

    def decorator(step_func: Callable[..., Step | None]):
        def wrapper(*args, **kwargs):
            def run_step() -> Step | None:
                get_next = step_func(*args, **kwargs)
                if get_next is None:
                    return None
                return get_next()

            if run_immediately:
                return run_step()
            else:
                return Step(
                    description=html,
                    run=run_step,
                )

        return wrapper

    return decorator


def steps_entry(
    folder="!!! trackmania-replay-bot",
    replay="ycnzzu02e5",
    ghost="ycnzzu02e5.Ghost.Gbx",
) -> Step | None:
    ############################################################################
    ############################################################################
    # Goto Replay Editor Step
    ############################################################################

    @stepmethod(bullets("Click CREATE", "Click REPLAY EDITOR"))
    def step_replay_editor():
        Bob().clickImage(
            "Menu_CreateButton.png", retry="Menu_CreateButton_Hover.png"
        ).wait(0.2)
        Bob().clickImage(
            "Menu_ReplayEditorButton.png", retry="Menu_ReplayEditorButton_Hover.png"
        ).wait(0.2)
        return group_select_replay

    ############################################################################
    ############################################################################
    # Start MediaTracker Group
    ############################################################################
    # This groups the following steps:
    # - Menu > Create > Replay Editor
    # - Select the replay
    # - Start the MediaTracker

    @stepmethod(run_immediately=True)
    def group_select_replay():
        ########################################################################
        @stepmethod(
            bullets("Click UP icon in the top left to navigate to the root folder")
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
            bullets(
                "Click icons in the top right to make the project folder visible",
                [
                    "Tree view",
                    "Sort by name",
                    "Sort ascending",
                ],
            )
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
        @stepmethod(bullets("Click the project folder", "Select the replay"))
        def step_replaypicker_folder():
            Bob().clickText(folder).wait(0.2)
            Bob().clickText(replay)
            return step_replaypicker_confirm

        ########################################################################
        @stepmethod(
            bullets(
                "Click the CONFIRM button",
                "Click the EDIT button",
                "Wait for the MediaTracker to load",
            ),
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

        # END Start MediaTracker Group #########################################

        return step_replaypicker_up

    ############################################################################
    ############################################################################
    # Render Group
    ############################################################################
    # This groups the following steps:
    # - Import ghost to render
    # - Remove old ghost
    # - Adjust camera track length to match ghost length
    # - Open render dialog

    @stepmethod(run_immediately=True)
    def group_render():
        ########################################################################
        @stepmethod(
            bullets(
                'Click the "Import ghosts..." button',
                "Click the project folder",
                "Click the file of the new ghost",
                "Click the OPEN button",
            ),
        )
        def step_mediatracker_addghost():
            Bob().clickImage("MediaTracker_Import_Button.png")
            # TODO: Make this configurable
            Bob().clickText(folder)
            Bob().clickText(ghost)
            Bob().clickImage(
                "MediaTracker_Import_Open.png",
                retry="MediaTracker_Import_Open_Hover.png",
            ).wait(0.2)

            return step_mediatracker_removeghost

        ########################################################################
        @stepmethod(
            bullets(
                "Select the old ghost using Shift+Down",
                "Click the DELETE button",
                "Confirm with ENTER",
            ),
            needs_focus=True,
        )
        def step_mediatracker_removeghost():
            Bob().tap(Key.down, modifiers=[Key.shift])
            Bob().tap(Key.down, modifiers=[Key.shift])
            Bob().clickImage("MediaTracker_DeleteBlock.png").wait(0.1)
            Bob().tap(Key.enter).wait(0.1)

            return step_mediatracker_copylength

        ########################################################################
        @stepmethod(
            bullets(
                "Select the new ghost using Shift+Up",
                "Copy the ghost length into clipboard",
            ),
            needs_focus=True,
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
            bullets(
                "Select the camera track using Shift+Up",
                "Paste the ghost length from clipboard",
                "Confirm with ENTER",
            ),
            needs_focus=True,
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
            bullets(
                "Split the camera track",
                "Click the DELETE button",
                "Confirm with ENTER",
            ),
            needs_focus=True,
        )
        def step_mediatracker_fitcamera():
            Bob().tap("l")
            Bob().clickImage("MediaTracker_DeleteBlock.png").wait(0.1)
            Bob().tap(Key.enter).wait(0.1)

            return step_mediatracker_openrender

        ########################################################################
        @stepmethod(
            bullets(
                'Click the "Render" button',
                "Click the CONFIRM button",
                "Wait for the render to finish",
            ),
        )
        def step_mediatracker_openrender():
            Bob().clickImage("MediaTracker_Render_Button.png").wait(0.1)
            Bob().clickImage(
                "MediaTracker_Render_Confirm.png",
                retry="MediaTracker_Render_Confirm_Hover.png",
            ).wait(0.1)

            # Wait for render to finish
            Bob().waitText("Player camera", timeout=60 * 60 * 24)

            # Done
            return None

        # END Render Group #####################################################

        return step_mediatracker_addghost

    # END steps_entry ##########################################################

    return step_replay_editor()

    ############################################################################
    ############################################################################
