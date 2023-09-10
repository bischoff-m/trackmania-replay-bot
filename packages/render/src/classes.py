from dataclasses import dataclass
from typing import Callable, List, Literal, Optional


@dataclass
class State:
    """This represents a state of the UI.

    title:
      Title shown when this state is active.
    description:
      Description shown when this state is active.
    actions:
      A dictionary of actions that can be executed in this state. Each is shown
      as a button with the key as the button text. When the button is clicked,
      the value is executed, which should return the next state.
    """

    title: str
    description: str
    buttons: List["Button"]


@dataclass
class Step:
    """A Step is a special type of State."""

    description: str
    run: Callable[[], "Step"]
    needs_focus: bool = False


@dataclass
class Button:
    name: str
    action: Callable[[], None]
    style: Optional[Literal["confirm", "cancel"]] = None
