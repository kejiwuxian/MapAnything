export const kitRadarDataset = {
  name: "Automotive OBD-II Dataset",
  shortName: "KIT RADAR · full archive",
  url: "https://radar.kit.edu/radar/en/dataset/bCtGxdTklQlfQcAq",
  doi: "10.35097/1130",
  version: "1",
  logCount: 81,
  readingCount: 2693824,
  channelCount: 10,
  archiveSize: "11.6 MB",
} as const;

export const kitRadarClusterCounts = [
  Math.round(kitRadarDataset.readingCount * 0.248),
  Math.round(kitRadarDataset.readingCount * 0.366),
  Math.round(kitRadarDataset.readingCount * 0.178),
  Math.round(kitRadarDataset.readingCount * 0.119),
  kitRadarDataset.readingCount - Math.round(kitRadarDataset.readingCount * 0.248) - Math.round(kitRadarDataset.readingCount * 0.366) - Math.round(kitRadarDataset.readingCount * 0.178) - Math.round(kitRadarDataset.readingCount * 0.119),
] as const;
