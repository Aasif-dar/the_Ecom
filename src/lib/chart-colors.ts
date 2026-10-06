// Categorical chart hues in fixed order (never cycled). Validated with the dataviz palette
// checker against the light surface: lightness band, chroma floor, CVD separation and 3:1 contrast.
export const CAT = ["#A8472A", "#0B8F83", "#AE7A12", "#4A5CB8"] as const;

export const CHART = {
  ink: "#14110F",
  clay: CAT[0],
  grid: "#E6DFD1",
  axis: "#6C655A",
  surface: "#FBF8F2",
} as const;
