import localFont from "next/font/local";

// Raster Forge — CC0 (GGBotNet), see assets/fonts/raster-forge/LICENSE.txt.
export const rasterForge = localFont({
  src: "../fonts/RasterForge-Regular.woff2",
  variable: "--font-raster-forge",
  display: "swap",
});

// Noto Sans TC Bold (SIL OFL, Google Fonts) — subsetted to just the four
// glyphs in "鳥舍雜俎" (the zh podcastName, Traditional characters). Re-subset
// from Google Fonts' css2 API with a wider `text=` param if this font is
// reused for other Chinese copy later.
export const notoSansTCHeadline = localFont({
  src: "../fonts/NotoSansTC-Bold-headline-subset.woff2",
  variable: "--font-noto-sans-tc-headline",
  weight: "700",
  display: "swap",
});
