from dataclasses import dataclass
from pathlib import Path
from typing import Callable, List, Literal, Optional, Tuple


@dataclass
class Config:
    trackmania_root: Path
    replay_ghost_pairs: List[Tuple[Path, Path]]


@dataclass
class State:
    """This represents a state of the UI.

    title : str
        Title shown when this state is active.
    description : str
        Description shown when this state is active.
    actions : dict[str, Callable[[], State]]
        A dictionary of actions that can be executed in this state. Each is
        shown as a button with the key as the button text. When the button is
        clicked, the value is executed, which should return the next state.
    word_wrap : bool
        Whether the description should wrap at word boundaries.
    """

    title: str
    description: str
    buttons: List["Button"]
    word_wrap: bool = True


@dataclass
class Step:
    """A Step is a special type of State."""

    description: str
    run: Callable[[], "Step | None"]
    needs_focus: bool = False


@dataclass
class Button:
    name: str
    action: Callable[[], None]
    style: Optional[Literal["confirm", "cancel", "disabled"]] = None
    disabled: bool = False
