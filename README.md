# trackmania-replay-bot

Selects Trackmania replays and composes them into a video. Built with Next.js
and Remotion.

**This project is a work in progress.**

My goal is to have the bot upload a fully edited video to YouTube weekly showing
the replay of the world record on some popular maps.

## Components of the bot

1. Choose maps that were popular last week and download the world record replays. _(Not started yet)_
1. Batch-render the replays using Trackmania. _(Only tested manually so far)_
1. Fetch map name, author, medals, leaderboard, etc. from [Trackmania.io](https://www.npmjs.com/package/trackmania.io). _(Mostly done)_
1. Compose the replays into a video using Remotion. _(Mostly done)_
1. Upload the video to YouTube. _(Not started yet)_

## Installation

Install Node.js and run

```bash
./> npm install
```

### If you want to use

Install Python 3 and run

```bash
./packages/render> pip install -r requirements.txt
```

If you use Visual Studio Code you can use venv to create a virtual environment
using

```bash
./packages/render> python -m venv .venv
./packages/render> ./.venv/Scripts/pip install -r requirements.txt
```

For Linux and macOS, you also have to install the tessaract binaries. See [screen-ocr](https://pypi.org/project/screen-ocr/) for more information.

## Usage

Run the development server and open [http://localhost:3000](http://localhost:3000):

```bash
./> npm run dev
```

The page serves as management interface for the bot. You will be able to start
the Remotion render process from there, view the cached data, selected replays
and other things I might find helpful.

## To Consider

The render process (pyautogui) was only tested on Windows with WinRT. If you are
on Linux or macOS, you have to install the tessaract binaries yourself.

## Thanks

- [Greep](https://github.com/GreepTheSheep) for his awesome work on [Trackmania.io for Node.js](https://www.npmjs.com/package/trackmania.io)
