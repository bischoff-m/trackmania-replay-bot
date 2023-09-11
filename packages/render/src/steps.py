from pathlib import Path
from typing import Callable, List, Optional

from api import Bob, LocateImageException
from classes import Step
from pynput.keyboard import Key

# This should point to /packages/render/static
STATIC_ROOT = Path(__file__).parent.parent / "static"


class ControlFlowException(Exception):
    def __str__(self):
        return (
            f"There was a general problem with controlling Trackmania: {self.args[0]}"
        )


def no_whitespace(text: str) -> str:
    return " ".join(text.split())


def bullets(
    *points: str | List[str], prefix: Optional[str] = "Trying to do the following:"
) -> str:
    """Formats a list of points into a HTML list.

    Parameters
    ----------
    points : str | List[str]
        The points to be formatted. If a list is given, it is recursively
        formatted.
    prefix : str, optional
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
    default_next: Optional[Callable[[], Step | None]] = None,
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
    needs_focus : bool, optional
        If True and the UI is open, Alt+Tab is simulated before the step is
        executed, by default False. This is useful for steps that use the
        keyboard.
    default_next : Callable[[], Step | None], optional
        If the decorated method returns None, this function is called to get the
        next step, by default lambda: None. Use this if the step always returns
        the same next step to make the code more readable.

    Returns
    -------
    Callable[..., Step | None]
        The wrapped step method
    """

    def decorator(step_func: Callable[..., Step | None]):
        def wrapper(*args, **kwargs):
            def run_step() -> Step | None:
                get_next = step_func(*args, **kwargs)
                if get_next is not None:
                    return get_next()
                elif default_next is not None:
                    return default_next()
                else:
                    return None

            if run_immediately:
                return run_step()
            else:
                return Step(
                    description=html,
                    run=run_step,
                    needs_focus=needs_focus,
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

    @stepmethod(
        bullets("Click CREATE", "Click REPLAY EDITOR"),
        default_next=lambda: group_select_replay(),
    )
    def step_replay_editor():
        bob = Bob(static_dir=STATIC_ROOT / "main_menu")
        bob.clickImage("CreateButton").wait(0.2)
        bob.clickImage("ReplayEditorButton").wait(0.2)

    ############################################################################
    ############################################################################
    # Start MediaTracker Group
    ############################################################################
    # This groups the following steps:
    # - Select the replay
    # - Start the MediaTracker

    @stepmethod(run_immediately=True, default_next=lambda: group_render())
    def group_select_replay():
        bob = Bob(static_dir=STATIC_ROOT / "replay_picker")

        ########################################################################
        @stepmethod(
            bullets("Click UP icon in the top left to navigate to the root folder")
        )
        def step_replaypicker_up():
            # Check if we are already at the root folder
            found = bob.findImage("EmptyPath") is not None

            # Press up button multiple times to get to the top
            for _ in range(10):
                if found:
                    break
                bob.clickImage("UpButton")
                found = bob.findImage("EmptyPath") is not None

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
            if bob.findImage("ListView") is not None:
                bob.clickImage("ListView")
            if bob.findImage("TreeView") is None:
                raise LocateImageException("ListView or TreeView")

            # Sort by name if not already sorted by name
            if bob.findImage("SortByTime") is not None:
                bob.clickImage("SortByTime")
            if bob.findImage("SortByName") is None:
                raise LocateImageException("SortByTime or SortByName")

            # Sort ascending if not already sorted ascending
            if bob.findImage("SortDescending") is not None:
                bob.clickImage("SortDescending")
            if bob.findImage("SortAscending") is None:
                raise LocateImageException("SortDescending or SortAscending")

            return step_replaypicker_folder

        ########################################################################
        @stepmethod(bullets("Click the project folder", "Select the replay"))
        def step_replaypicker_folder():
            bob.clickText(folder).wait(0.2)
            bob.clickText(replay)
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
            bob.clickImage("ConfirmButton").wait(0.2)
            bob.clickImage("EditButton").wait(0.2)
            bob.waitText("Player camera", timeout=5)

            return None

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
        bob = Bob(static_dir=STATIC_ROOT / "media_tracker")

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
            bob.clickImage("Import_Button")
            # TODO: Make this configurable
            bob.clickText(folder)
            bob.clickText(ghost)
            bob.clickImage("Import_Open").wait(0.2)

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
            bob.tap(Key.down, modifiers=[Key.shift])
            bob.tap(Key.down, modifiers=[Key.shift])
            bob.clickImage("DeleteBlock").wait(0.1)
            bob.tap(Key.enter).wait(0.1)

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
            bob.tap(Key.up, modifiers=[Key.shift])
            bob.tap(Key.down, modifiers=[Key.shift])
            bob.clickRelative(2470 / 2560, 1184 / 1440).wait(0.1)
            bob.tap("a", modifiers=[Key.ctrl])
            bob.tap("c", modifiers=[Key.ctrl])
            bob.tap(Key.esc)

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
            bob.tap(Key.up, modifiers=[Key.shift])
            bob.clickRelative(920 / 2560, 1100 / 1440).wait(0.1)
            bob.tap("a", modifiers=[Key.ctrl])
            bob.tap("v", modifiers=[Key.ctrl])
            bob.tap(Key.enter)

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
            bob.tap("l")
            bob.clickImage("DeleteBlock").wait(0.1)
            bob.tap(Key.enter).wait(0.1)

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
            bob.clickImage("Render_Button").wait(0.1)
            bob.clickImage("Render_Confirm").wait(0.1)

            # Wait for render to finish
            bob.waitText("Player camera", timeout=60 * 60 * 24)

            # Done
            return None

        # END Render Group #####################################################

        return step_mediatracker_addghost

    # END steps_entry ##########################################################

    return step_replay_editor()

    ############################################################################
    ############################################################################
