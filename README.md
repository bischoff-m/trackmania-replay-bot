# trackmania-replay-bot

Selects Trackmania replays and composes them into a video. Built with Next.js
and Remotion.

**This project is a work in progress.**

My goal is to have the bot upload a fully edited video to YouTube weekly showing
the replay of the world record on some popular maps.

## Components of the bot

1. Choose maps that were popular last week and download the world record replays. _(Not started yet)_
1. Batch-render the replays using Trackmania. _(Only tested manually so far)_
1. Fetch map name, author, medals, leaderboard, etc. from [Trackmania.io](https://www.npmjs.com/package/trackmania.io). _(Started)_
1. Compose the replays into a video using Remotion. _(Base layout done)_
1. Upload the video to YouTube. _(Not started yet)_

## Getting Started

Run the development server and open [http://localhost:3333](http://localhost:3333):

```bash
npm run dev
```

The page serves as management interface for the bot. You will be able to start
the Remotion preview and render process from there, view the cached data,
selected replays and other things I might find helpful.

## Thanks

- [Greep](https://github.com/GreepTheSheep) for his awesome work on [Trackmania.io for Node.js](https://www.npmjs.com/package/trackmania.io)
