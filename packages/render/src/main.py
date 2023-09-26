import argparse
import json
from pathlib import Path

from classes import Config, RenderTask
from control import Control
from jsonschema import validate
from steps import steps_entry


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--json",
        default=None,
        action="store",
        type=str,
        help="config JSON payload with local file paths",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="use the file debug_config.json instead of --json",
    )
    parser.add_argument(
        "--silent",
        action="store_true",
        help="only show the GUI when an error occurs",
    )

    args = parser.parse_args()
    if not ((args.json is not None) ^ args.debug):
        raise Exception("Expected either --json [JSON] or --debug")

    return args


def parse_config(args: argparse.Namespace) -> Config:
    root = Path(__file__).parent.parent
    if args.json is not None:
        try:
            config: dict = json.loads(args.json)
        except:
            raise Exception("JSON payload could not be parsed")

    if args.debug:
        debug_file = root / "debug_config.json"
        if not debug_file.exists():
            raise Exception("Debug file does not exist")
        with debug_file.open() as f:
            config: dict = json.load(f)

    schema_file = root / "config.schema.json"
    with schema_file.open() as f:
        schema = json.load(f)
    try:
        validate(config, schema)
    except:
        raise Exception("JSON payload does not match schema")

    return Config(
        trackmania_root=Path(config["trackmaniaRoot"]),
        render_tasks=[
            RenderTask(
                ghost_path=Path(task["ghostPath"]),
                replay_path=Path(task["replayPath"]),
                output_path=Path(task["outputPath"]),
            )
            for task in config["renderTasks"]
        ],
    )


if __name__ == "__main__":
    args = parse_args()
    config = parse_config(args)

    control = Control(lambda: steps_entry(config))
    if not (args.silent and control.run_silent()):
        control.run_window()
