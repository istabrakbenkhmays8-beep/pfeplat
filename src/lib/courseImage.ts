/**
 * Per-vendor Unsplash imagery for course cards. Hand-picked, stable photo IDs.
 * Using Unsplash's `images.unsplash.com` direct URLs with size params keeps the
 * footprint small and respects their hotlinking guidelines.
 */
const VENDOR_IMAGES: Record<string, string> = {
  Cisco: "photo-1558494949-ef010cbdcc31", // server racks / networking
  Microsoft: "photo-1521737604893-d14cc237f11d", // people coding on laptops
  Fortinet: "photo-1550751827-4bd374c3f58b", // security / lock
  PaloAlto: "photo-1563013544-824ae1b704d3", // cybersecurity dashboards
  IBM: "photo-1551434678-e076c223a692", // data center
  "EC-Council": "photo-1614064641938-3bbee52942c7", // hacker keyboard
  PECB: "photo-1454165804606-c3d57bc86b40", // audit / documents
  PeopleCert: "photo-1552664730-d307ca884978", // training session
  PMI: "photo-1552581234-26160f608093", // project planning
  Togaf: "photo-1531973576160-7125cd663d86", // architecture
  Linux: "photo-1629654297299-c8506221ca97", // terminal / code
};

const FALLBACK = "photo-1573164713988-8665fc963095"; // engineer at whiteboard

export function courseImageFor(vendor: string, width = 800): string {
  const id = VENDOR_IMAGES[vendor] ?? FALLBACK;
  return `https://images.unsplash.com/${id}?w=${width}&q=70&auto=format&fit=crop`;
}
