import { renderOgImage, ogSize } from "@/lib/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ title: "Learn faster. Build smarter. Stay ahead in tech.", eyebrow: "Developer blog" });
}
