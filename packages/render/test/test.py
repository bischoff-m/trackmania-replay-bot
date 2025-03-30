# %%

from datetime import timedelta
from pathlib import Path
from timeit import default_timer as timer
from typing import List, Tuple

import cv2 as cv
import numpy as np
from template_matching import *


def read_image(filename: str) -> np.ndarray:
    path = str((Path(__file__).parent / filename).resolve())
    img = cv.imread(path, cv.IMREAD_GRAYSCALE)
    return img


base_imgs = {
    # "1 Match 1440p": read_image("example_1 match.png"),
    # "No Match 1440p": read_image("example_no match.png"),
    # "4 Matches 1440p": read_image("example_4 matches.png"),
    # "1 Match 1080p": read_image("example_1 match_1080p.png"),
    # "No Match 1080p": read_image("example_no match_1080p.png"),
    "4 Matches 1080p": read_image("example_4 matches_1080p.png"),
    # "1 Match 720p": read_image("example_1 match_720p.png"),
    # "No Match 720p": read_image("example_no match_720p.png"),
    # "4 Matches 720p": read_image("example_4 matches_720p.png"),
}
needle_img = read_image("UpButton.png")

for base_name, base_img in base_imgs.items():
    print()
    print(f"Searching in {base_name}")

    start = timer()
    matches = locate_template_structure(base_img, needle_img, verbose=False)
    print(f"Number of matches found: {len(matches)}")
    end = timer()
    print(f"Time taken: {timedelta(seconds=end-start)}")
    break
