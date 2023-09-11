import time
from pathlib import Path
from typing import Callable, List, Optional

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

reader = Reader.create_reader(backend="winrt")  # screen_ocr
keyboard = Controller()  # pynput


class LocateImageException(Exception):
    def __str__(self):
        return f"Could not locate image on screen: {self.args[0]}"


class LocateTextException(Exception):
    def __str__(self):
        return f"Could not locate text on screen: {self.args[0]}"


def chainable(func: Callable[..., None]):
    """Decorator to make a function chainable."""

    def wrapper(self, *args, **kwargs):
        func(self, *args, **kwargs)
        return self

    return wrapper


class Bob:
    """This is Bob. You tell him what to do and he does it.

    Example:
    `Bob().tap(Key.up).wait(0.3).clickImage("MenuCreateButton.png")`
    """

    def __init__(self, static_dir: Optional[Path] = None):
        self._static_dir = static_dir.resolve() if static_dir else None

    def findImage(self, name: str, extension: str = "png") -> pyautogui.Point | None:
        """Finds the coordinates of an image on the screen.

        Parameters
        ----------
        image : str
            The image to search for, path relative to the static directory.
        extension : str, optional
            The extension of the image. Defaults to "png".

        Returns
        -------
        pyautogui.Point | None
            The center of the image on the screen or None if it could not be
            found.
        """
        if self._static_dir is None:
            raise ValueError("static_dir must be set when using findImage")

        image_path = self._static_dir / f"{name}.{extension}"
        retry_path = self._static_dir / f"{name}_HOVER.{extension}"

        loc = pyautogui.locateCenterOnScreen(image_path.as_posix())
        if loc is None and retry_path.exists():
            loc = pyautogui.locateCenterOnScreen(retry_path.as_posix())
        return loc

    def findText(self, text: str) -> pyautogui.Point | None:
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
    def tap(self, key: Key, modifiers: Optional[List[Key]] = None) -> "Bob":
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
        self.wait(0.05)
        keyboard.release(key)
        for modifier in modifiers or []:
            keyboard.release(modifier)
        self.wait(0.05)

    @chainable
    def wait(self, seconds: float) -> "Bob":
        """Waits for a given amount of seconds.

        Parameters
        ----------
        seconds : float
            How many seconds to wait.
        """
        time.sleep(seconds)

    @chainable
    def click(self, x: int, y: int) -> "Bob":
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
    def clickRelative(self, x_percent: float, y_percent: float) -> "Bob":
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
        self.click(x, y)

    @chainable
    def clickImage(self, image: str, extension: str = "png") -> "Bob":
        """Clicks on an image on the screen.

        Parameters
        ----------
        image : str
            The image to search for, path relative to the static directory.
        extension : str, optional
            The extension of the image. Defaults to "png".

        Raises
        ------
        LocateImageException
            If the image could not be found.
        """
        location = self.findImage(image, extension)
        if location is None:
            raise LocateImageException(image)
        self.click(*location)

    @chainable
    def clickText(self, text: str) -> "Bob":
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
        location = self.findText(text)
        if location is None:
            raise LocateTextException(text)
        self.click(*location)

    @chainable
    def waitImage(
        self, image: str, interval: float = 0.5, timeout: float = 30
    ) -> "Bob":
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
        found = self.findImage(image)
        for _ in range(int(timeout / interval)):
            if found:
                break
            self.wait(interval)
            found = self.findImage(image)
        if not found:
            raise LocateImageException(image)

    @chainable
    def waitText(self, text: str, interval: float = 0.5, timeout: float = 30) -> "Bob":
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
        found = self.findText(text)
        for _ in range(int(timeout / interval)):
            if found:
                break
            self.wait(interval)
            found = self.findText(text)
        if not found:
            raise LocateTextException(text)
