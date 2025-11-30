export enum LocationMode {
  ONLINE = "ONLINE",
  CAMPUS_1 = "CAMPUS_1",
  CAMPUS_2 = "CAMPUS_2",
}

export const LocationModeLabels: Record<LocationMode, string> = {
  [LocationMode.ONLINE]: "Online (Meet/Zoom)",
  [LocationMode.CAMPUS_1]: "Campus 1 (Lý Thường Kiệt)",
  [LocationMode.CAMPUS_2]: "Campus 2 (Dĩ An)",
};
