export type ClipData = {
  startFrame: number;
  introData?: {
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
  videoData: {
    videoFile: string;
    durationInFrames: number;
  };
};
