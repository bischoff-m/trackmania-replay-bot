import time
from pathlib import Path
from typing import List

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


def chainable(func):
    """Decorator to mark a static function as chainable."""
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

    @staticmethod
    def findImage(image: str, retry: str = None) -> pyautogui.Point | None:
        """Finds the coordinates of an image on the screen.

        Parameters
        ----------
        image : str
            The image to search for, path relative to the static directory.
        retry : str, optional
            The image to retry if the first one could not be found. Defaults to
            None.

        Returns
        -------
        pyautogui.Point | None
            The center of the image on the screen or None if it could not be
            found.
        """
        img_path = (STATIC_DIR / image).resolve().as_posix()
        loc = pyautogui.locateCenterOnScreen(img_path)
        if loc is None and retry is not None:
            img_path = (STATIC_DIR / retry).resolve().as_posix()
            loc = pyautogui.locateCenterOnScreen(img_path)
        return loc

    @staticmethod
    def findText(text: str) -> pyautogui.Point | None:
        """Finds the coordinates of text on the screen.

        Parameters
        ----------
        text : str
            The text to search for.

        Returns
        -------
        pyautogui.Point | None
            The center of the text on the screen or None if it could not be
            found.
        """
        screen_resolution = pyautogui.size()
        contents = reader.read_screen(bounding_box=(0, 0, *screen_resolution))

        matches = contents.find_matching_words(text)
        if len(matches) == 0:
            return None
        elif len(matches) > 1:
            raise LocateTextException(f"Multiple matches for {text}")

        first_match = matches[0][0]
        center = (
            first_match.left + first_match.width / 2,
            first_match.top + first_match.height / 2,
        )
        return center

    @chainable
    def tap(key: Key, modifiers: List[Key] = None):
        """Presses a key and releases it. Optionally, modifiers can be pressed as well.

        Parameters
        ----------
        key : Key
            The key to press.
        modifiers : List[Key], optional
            The modifiers to press. Defaults to None.
        """
        for modifier in modifiers or []:
            keyboard.press(modifier)
        keyboard.press(key)
        Bob.wait(0.05)
        keyboard.release(key)
        for modifier in modifiers or []:
            keyboard.release(modifier)
        Bob.wait(0.05)

    @chainable
    def wait(seconds: float):
        """Waits for a given amount of seconds.

        Parameters
        ----------
        seconds : float
            How many seconds to wait.
        """
        time.sleep(seconds)

    @chainable
    def click(x: int, y: int):
        """Clicks at the given coordinates and moves the mouse back to its previous position.

        Parameters
        ----------
        x : int
            Where to click on the x-axis.
        y : int
            Where to click on the y-axis.
        """
        prev_pos = pyautogui.position()
        # You could also use pyautogui.click(x, y) but Trackmania did not
        # recognize the click sometimes
        pyautogui.moveTo(x, y)
        pyautogui.click()
        pyautogui.moveTo(*prev_pos)

    @chainable
    def clickRelative(x_percent: float, y_percent: float):
        """Clicks at the given relative coordinates and moves the mouse back to its previous position.

        Parameters
        ----------
        x_percent : float
            Where to click on the x-axis relative to the main screen width.
        y_percent : float
            Where to click on the y-axis relative to the main screen height.
        """
        screen_resolution = pyautogui.size()
        x = screen_resolution[0] * x_percent
        y = screen_resolution[1] * y_percent
        Bob.click(x, y)

    @chainable
    def clickImage(image: str, retry: str = None):
        """Clicks on an image on the screen.

        Parameters
        ----------
        image : str
            The image to search for, path relative to the static directory.
        retry : str, optional
            The image to retry if the first one could not be found. Defaults to
            None.

        Raises
        ------
        LocateImageException
            If the image could not be found.
        """
        location = Bob.findImage(image, retry)
        if location is None:
            raise LocateImageException(image)
        Bob.click(*location)

    @chainable
    def clickText(text: str):
        """Clicks on text on the screen.

        Parameters
        ----------
        text : str
            The text to search for.

        Raises
        ------
        LocateTextException
            If the text could not be found.
        """
        location = Bob.findText(text)
        if location is None:
            raise LocateTextException(text)
        Bob.click(*location)

    @chainable
    def waitImage(image: str, interval: float = 0.5, timeout: float = 30):
        """Waits for an image to appear on the screen.

        Parameters
        ----------
        image : str
            The image to search for, path relative to the static directory.
        interval : float, optional
            In which interval to poll for the image in seconds. Defaults to 0.5.
        timeout : float, optional
            After how many seconds to stop polling. Defaults to 30.

        Raises
        ------
        LocateImageException
            If the image could not be found after the timeout.
        """
        found = Bob().findImage(image)
        for _ in range(int(timeout / interval)):
            if found:
                break
            Bob().wait(interval)
            found = Bob().findImage(image)
        if not found:
            raise LocateImageException(image)

    @chainable
    def waitText(text: str, interval: float = 0.5, timeout: float = 30):
        """Waits for text to appear on the screen.

        Parameters
        ----------
        text : str
            The text to search for.
        interval : float, optional
            In which interval to poll for the text in seconds. Defaults to 0.5.
        timeout : float, optional
            After how many seconds to stop polling. Defaults to 30.

        Raises
        ------
        LocateTextException
            If the text could not be found after the timeout.
        """
        found = Bob().findText(text)
        for _ in range(int(timeout / interval)):
            if found:
                break
            Bob().wait(interval)
            found = Bob().findText(text)
        if not found:
            raise LocateTextException(text)
