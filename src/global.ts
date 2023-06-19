export type ReplayData = { [clipID: string]: ClipData };

export type ClipData = {
  startFrame: number;
  durationInFrames: number;
  introData: IntroData;
  videoData: {
    videoFile: string;
    durationInFrames: number;
  };
};

export type IntroData = {
  mapName: string;
  mapAuthor: string;
  mapAuthorNation: string;
  medals: {
    author: number;
    gold: number;
    silver: number;
    bronze: number;
  };
  leaderboard: Ranking[];
  thumbnailFile: string;
  uploadedAt: Date;
  playerCount: number | [number, number];
};

export type Ranking = {
  name: string;
  time: number;
  nation: string;
};

export const exampleCompData: ReplayData = {
  olsKnq_qAghcVAnEkoeUnVHFZei: {
    startFrame: 0,
    durationInFrames: 60 * 5 + 450,
    introData: {
      mapName: "Test Map",
      mapAuthor: "Test Author",
      mapAuthorNation: "FRA",
      medals: {
        author: 7528,
        gold: 8000,
        silver: 11000,
        bronze: 14000,
      },
      leaderboard: [
        {
          name: "ASdaS-BLR",
          // time: "0:07.428",
          time: 7431,
          nation: "ITA",
          // delta: "+0:00.000",
        },
        {
          name: "zzzzznot7_Harry",
          // time: "0:07.428",
          time: 7431,
          nation: "ENG",
          // delta: "+0:00.002",
        },
        {
          name: "Flechetas",
          // time: "0:07.428",
          time: 7431,
          nation: "FRA",
          // delta: "+0:00.002",
        },
        {
          name: "del2211261250015955839",
          // time: "0:07.428",
          time: 7431,
          nation: "ITA",
          // delta: "+0:00.002",
        },
        {
          name: "KarjeN",
          // time: "0:07.428",
          time: 7431,
          nation: "SWE",
          // delta: "+0:00.002",
        },
        {
          name: "poupipou.",
          // time: "0:07.428",
          time: 7431,
          nation: "FRA",
          // delta: "+0:00.002",
        },
        {
          name: "Perchignon",
          // time: "0:07.428",
          time: 7431,
          nation: "FRA",
          // delta: "+0:00.002",
        },
        {
          name: "KaarloKek",
          // time: "0:07.428",
          time: 7431,
          nation: "FIN",
          // delta: "+0:00.002",
        },
        {
          name: "ZedroXTM",
          // time: "0:07.428",
          time: 7431,
          nation: "FRA",
          // delta: "+0:00.002",
        },
        {
          name: "Stormyymate",
          // time: "0:07.428",
          time: 7431,
          nation: "AUS",
          // delta: "+0:00.002",
        },
      ],
      thumbnailFile: "/remotion/Thumbnail.jpg",
      uploadedAt: new Date("2021-01-01T00:00:00.000Z"),
      playerCount: [3000000, 4000000],
    },
    videoData: {
      videoFile: "/remotion/video-cache/Video1.webm",
      durationInFrames: 450,
    },
  },
};
