import asyncio
from pathlib import Path
from typing import Callable, Literal

import pyautogui
from pynput.keyboard import Controller, Key
from screen_ocr import Reader

################################################################################
# NOTES
#
# I did not use the keyboard module of pyautogui because Trackmania did not seem
# to recognize any keypresses, e.g. pyautogui.press("esc"). The problem did not
# occur with pynput.
#
################################################################################

# This should point to /packages/render/static
STATIC_DIR = Path(__file__).parent.parent / "static"

_StateType = Literal["menu", "editor", "desktop"]

reader = Reader.create_reader(backend="winrt")  # screen_ocr
keyboard = Controller()  # pynput
chainable_functions = []


class LocateImageException(Exception):
    def __str__(self):
        return f"Could not locate image on screen: {self.args[0]}"


class LocateTextException(Exception):
    def __str__(self):
        return f"Could not locate text on screen: {self.args[0]}"


# Decorator to mark a static function as chainable
def chainable(func):
    chainable_functions.append(func.__name__)
    return staticmethod(func)


class Bob:
    """This is Bob. You tell him what to do and he does it.

    Example:
    `Bob().tap(Key.up).wait(0.3).clickImage("MenuCreateButton.png")`

    If you only want to execute one function, you can also do:
    `await Bob.clickImage("MenuCreateButton.png")`
    (Notice the missing parentheses)
    """

    def __getattribute__(self, name):
        attr = super().__getattribute__(name)

        # If the attribute is a function that is marked as chainable
        if name in chainable_functions:
            # Wrap the method in a function that waits for the method to finish
            # and returns Bob afterwards so that more methods can be chained
            def _chainable(*args, **kwargs):
                asyncio.get_event_loop().run_until_complete(attr(*args, **kwargs))
                return self

            return _chainable

        # Otherwise, act as usual
        return attr

    @chainable
    async def click(x: int, y: int):
        pyautogui.click(x, y)

    @chainable
    async def clickImage(image: str):
        img_path = (STATIC_DIR / image).resolve().as_posix()
        location = pyautogui.locateCenterOnScreen(img_path)
        if location is None:
            raise LocateImageException(image)
        print(f"Found image {image} at {location}.")
        pyautogui.click(location)
        await asyncio.sleep(0.3)

    @chainable
    async def clickText(text: str):
        screen_resolution = pyautogui.size()
        contents = reader.read_screen(bounding_box=(0, 0, *screen_resolution))

        matches = contents.find_matching_words(text)
        if len(matches) == 0:
            raise LocateTextException(text)

        first_match = matches[0][0]
        center = (
            first_match.left + first_match.width / 2,
            first_match.top + first_match.height / 2,
        )
        await Bob.click(*center)

    @chainable
    async def tap(key: Key):
        keyboard.tap(key)

    @chainable
    async def wait(seconds: float):
        await asyncio.sleep(seconds)


class API:
    def __init__(self):
        self._state: _StateType = "desktop"
        self._menu = Menu(
            lambda: self._state, lambda state: setattr(self, "_state", state)
        )

    def getMenu(self):
        return self._menu


class Menu:
    def __init__(
        self, get_state: Callable[[], bool], set_state: Callable[[_StateType], None]
    ):
        self._get_state = get_state
        self._set_state = set_state

    def _checkIsActive(self):
        if self._get_state() != "menu":
            raise Exception("Cannot perform action if game is not in main menu.")

    async def runGame(self):
        if self._get_state() != "desktop":
            raise Exception("Game is already running.")
        print("I skipped this step for now. Please start the game manually.")
        self._set_state("menu")

    async def editReplay(self):
        self._checkIsActive()

        # TODO: Implement focussing the game window or make sure it is already focused
        # await asyncio.sleep(3)

        try:
            Bob().clickImage("MenuCreateButton.png")
        except LocateImageException:
            Bob().tap(Key.up).wait(0.3).clickImage("MenuCreateButton.png")

        Bob().clickImage("MenuReplayEditorButton.png")

        # TODO: Wait for files to download and for editor to load
