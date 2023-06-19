export type CompositionData = { [clipID: string]: ClipData };

export type ClipData = {
  startFrame: number;
  introData?: IntroData;
  videoData: {
    videoFile: string;
    durationInFrames: number;
  };
};

export type IntroData = {
  mapName: string;
  mapAuthor: string;
  mapAuthorCountry: string;
  medals: {
    author: string;
    gold: number;
    silver: number;
    bronze: number;
  };
  leaderboard: {
    name: string;
    time: number;
    country: string;
  }[];
  thumbnailFile: string;
  uploadedAt: string;
  playerCount: string;
};
