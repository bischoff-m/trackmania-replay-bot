import time
from pathlib import Path

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
    `Bob.clickImage("MenuCreateButton.png")`
    (Notice the missing parentheses)
    """

    def __getattribute__(self, name):
        attr = super().__getattribute__(name)

        # If the attribute is a function that is marked as chainable
        if name in chainable_functions:
            # Wrap the method in a function that waits for the method to finish
            # and returns Bob afterwards so that more methods can be chained
            def _chainable(*args, **kwargs):
                attr(*args, **kwargs)
                return self

            return _chainable

        # Otherwise, act as usual
        return attr

    @chainable
    def click(x: int, y: int):
        pyautogui.click(x, y)

    @chainable
    def clickImage(image: str):
        img_path = (STATIC_DIR / image).resolve().as_posix()
        location = pyautogui.locateCenterOnScreen(img_path)
        if location is None:
            raise LocateImageException(image)
        print(f"Found image {image} at {location}.")
        pyautogui.click(location)
        time.sleep(0.3)

    @chainable
    def clickText(text: str):
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
        Bob.click(*center)

    @chainable
    def tap(key: Key):
        keyboard.tap(key)

    @chainable
    def wait(seconds: float):
        time.sleep(seconds)
