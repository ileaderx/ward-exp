import { ImageResponse } from "next/og";
import { AppIconArt } from "@/components/AppIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS adds its own rounded mask, so the art is square.
export default function AppleIcon() {
  return new ImageResponse(<AppIconArt size={180} rounded={false} />, size);
}
