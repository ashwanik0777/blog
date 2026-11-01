// Hosts whose images may go through the Next.js image optimizer.
// Only fast, reliable CDNs belong here: images hotlinked from other websites
// are loaded directly by the browser instead, because those sites are often
// slow or block server-side fetches (the optimizer then times out with a 500).
// Use Settings → Maintenance → "Import images" to move hotlinked images to Cloudinary.
export const OPTIMIZED_IMAGE_HOSTS = ["res.cloudinary.com", "images.unsplash.com", "i.ytimg.com"];
