import random
import shutil
import string
from collections.abc import Generator
from pathlib import Path
from typing import Callable, List, Optional

from api import Bob, LocateImageException
from classes import Config, Step
from pynput.keyboard import Key

# This should point to /packages/render/static
STATIC_ROOT = Path(__file__).parent.parent / "static"


class ControlFlowException(Exception):
    def __str__(self):
        return (
            f"There was a general problem with controlling Trackmania: {self.args[0]}"
        )


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
):
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

    Returns
    -------
    Callable[..., Step | None]
        The wrapped step method
    """

    def decorator(step_func: Callable[..., Callable[[], Step | None]]):
        def wrapper(*args, **kwargs):
            def run_step() -> Step | None:
                get_next = step_func(*args, **kwargs)
                if get_next is None:
                    return None
                else:
                    return get_next()

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


def steps_entry(config: Config) -> Generator[Step]:
    """
    Step history is cleared between each yield.
    """
    # Create project folder
    project_folder = "!!!!!! trackmania-replay-bot"
    root_path = (config.trackmania_root / "Replays" / project_folder).resolve()
    if not root_path.exists():
        root_path.mkdir()

    # Open project folder in replay picker
    yield group_open_picker(project_folder)

    for replay_path, ghost_path in config.replay_ghost_pairs:
        # Clear project folder
        for file in root_path.iterdir():
            if file.name.endswith(".Replay.Gbx") or file.name.endswith(".Ghost.Gbx"):
                file.unlink()

        # Generate random name for replay and ghost to avoid conflicts
        alphabet = string.digits.replace("1", "")
        copy_name = "".join(random.choices(alphabet, k=16))

        # Create replay and ghost copies
        replay_copy = root_path / f"{copy_name}.Replay.Gbx"
        ghost_copy = root_path / f"{copy_name}.Ghost.Gbx"
        shutil.copy(replay_path, replay_copy)
        shutil.copy(ghost_path, ghost_copy)

        yield group_pick_replay(copy_name)
        yield group_edit_replay(project_folder, ghost_copy.name)
        yield group_render_replay(copy_name)

        # Should now be back in replay picker

        # Delete replay and ghost copies
        replay_copy.unlink()
        ghost_copy.unlink()


################################################################################
################################################################################
# Open Replay Picker Group
################################################################################
# This groups the following steps:
# - Open the replay picker
# - Navigate to the project folder


@stepmethod(run_immediately=True)
def group_open_picker(folder_name: str):
    bob = Bob(static_dir=STATIC_ROOT / "replay_picker")

    ############################################################################
    @stepmethod(bullets("Click CREATE", "Click REPLAY EDITOR"))
    def step_replay_editor():
        bob.clickImage("CreateButton").wait(0.2)
        bob.clickImage("ReplayEditorButton").wait(0.2)
        return step_up

    ############################################################################
    @stepmethod(bullets("Click UP icon in the top left to navigate to the root folder"))
    def step_up():
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

        if bob.findText(folder_name) is None:
            return step_sort
        else:
            return step_folder

    ############################################################################
    @stepmethod(
        bullets(
            "Click the refresh button",
            "Click icons in the top right to make the project folder visible",
            [
                "Tree view",
                "Sort by name",
                "Sort ascending",
            ],
        )
    )
    def step_sort():
        bob.clickImage("RefreshButton").wait(0.5)

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

        return step_folder

    ############################################################################
    @stepmethod(bullets("Click the project folder"))
    def step_folder():
        bob.clickText(folder_name).wait(0.2)

        # Done
        return None

    ############################################################################

    return step_replay_editor


################################################################################
################################################################################
# Pick Replay Group
################################################################################
# This groups the following steps:
# - Select the replay
# - Start the MediaTracker


@stepmethod(run_immediately=True)
def group_pick_replay(replay_name: str):
    bob = Bob(static_dir=STATIC_ROOT / "replay_picker")

    ############################################################################
    @stepmethod(
        bullets(
            "Click the refresh button",
            "Select the replay",
            "Click the CONFIRM button",
        )
    )
    def step_select():
        bob.clickImage("RefreshButton").wait(0.5)
        bob.clickText(replay_name)
        bob.clickImage("ConfirmButton").wait(0.2)
        return step_confirm

    ############################################################################
    @stepmethod(
        bullets(
            "Click the EDIT button",
            "Wait for the MediaTracker to load",
        ),
    )
    def step_confirm():
        bob.clickImage("EditButton").wait(0.2)
        bob.waitText("Player camera", timeout=5)

        # Done
        return None

    ############################################################################

    return step_select


################################################################################
################################################################################
# Edit Replay Group
################################################################################
# This groups the following steps:
# - Import ghost to render
# - Remove old ghost
# - Adjust camera track length to match ghost length
# - Open render dialog


@stepmethod(run_immediately=True)
def group_edit_replay(folder_name: str, ghost_name: str):
    bob = Bob(static_dir=STATIC_ROOT / "edit_replay")

    ############################################################################
    @stepmethod(
        bullets(
            'Click the "Import ghosts..." button',
            "Click the project folder",
            "Click the file of the new ghost",
            "Click the OPEN button",
        ),
    )
    def step_add_ghost():
        bob.clickImage("ImportButton")
        bob.clickText(folder_name)
        bob.clickText(ghost_name)
        bob.clickImage("ImportOpen").wait(0.2)

        return step_remove_ghost

    ############################################################################
    @stepmethod(
        bullets(
            "Select the old ghost using Shift+Down",
            "Click the DELETE button",
            "Confirm with ENTER",
        ),
        needs_focus=True,
    )
    def step_remove_ghost():
        bob.tap(Key.down, modifiers=[Key.shift])
        bob.tap(Key.down, modifiers=[Key.shift])
        bob.clickImage("DeleteBlock").wait(0.1)
        bob.tap(Key.enter).wait(0.1)

        return step_copy_length

    ############################################################################
    @stepmethod(
        bullets(
            "Select the new ghost using Shift+Up",
            "Copy the ghost length into clipboard",
        ),
        needs_focus=True,
    )
    def step_copy_length():
        bob.tap(Key.up, modifiers=[Key.shift])
        bob.tap(Key.down, modifiers=[Key.shift])
        bob.clickRelative(2470 / 2560, 1184 / 1440).wait(0.1)
        bob.tap("a", modifiers=[Key.ctrl])
        bob.tap("c", modifiers=[Key.ctrl])
        bob.tap(Key.esc)

        return step_paste_length

    ############################################################################
    @stepmethod(
        bullets(
            "Select the camera track using Shift+Up",
            "Paste the ghost length from clipboard",
            "Confirm with ENTER",
        ),
        needs_focus=True,
    )
    def step_paste_length():
        bob.tap(Key.up, modifiers=[Key.shift])
        bob.clickRelative(920 / 2560, 1100 / 1440).wait(0.1)
        bob.tap("a", modifiers=[Key.ctrl])
        bob.tap("v", modifiers=[Key.ctrl])
        bob.tap(Key.enter)

        return step_fit_camera

    ############################################################################
    @stepmethod(
        bullets(
            "Split the camera track",
            "Click the DELETE button",
            "Confirm with ENTER",
        ),
        needs_focus=True,
    )
    def step_fit_camera():
        bob.tap("l")
        bob.clickImage("DeleteBlock").wait(0.1)
        bob.tap(Key.enter).wait(0.1)

        return step_open_render

    ############################################################################
    @stepmethod(bullets('Click the "Render" button'))
    def step_open_render():
        bob.clickImage("RenderButton").wait(0.1)

        # Done
        return None

    ############################################################################

    return step_add_ghost


################################################################################
################################################################################
# Render Replay Group
################################################################################
# This groups the following steps:
# - Confirm render
# - Wait for render to finish
# - Return to replay picker


@stepmethod(run_immediately=True)
def group_render_replay(replay_name: str):
    bob = Bob(static_dir=STATIC_ROOT / "render_replay")

    ############################################################################
    @stepmethod(
        bullets(
            "Click the CONFIRM button",
            "Wait for the render to finish",
        ),
    )
    def step_start_render():
        bob.clickImage("RenderConfirm").wait(0.1)
        # Wait for render to finish
        bob.waitText("Player camera", timeout=60 * 60 * 24)

        return step_return_to_replay_picker

    ############################################################################
    @stepmethod(
        bullets(
            "Press Escape to exit the MediaTracker",
            "Confirm with ENTER",
            "Press Escape to show the replay picker",
        ),
        needs_focus=True,
    )
    def step_return_to_replay_picker():
        bob.tap(Key.esc).wait(0.1)
        bob.tap(Key.enter).wait(0.1)
        bob.tap(Key.esc).wait(0.1)
        bob.clickText(replay_name).wait(0.1)

        # Done
        return None

    ############################################################################

    return step_start_render


################################################################################
################################################################################
