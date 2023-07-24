import asyncio
import logging

import nest_asyncio
from api import API

nest_asyncio.apply()


async def main():
    menu = API().getMenu()
    await menu.runGame()
    await menu.editReplay()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Process interrupted")
    finally:
        logging.info("Successful shutdown")
