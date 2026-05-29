/**
 * Per-domain Unsplash photos for the "Browse by domain" grid on the home page.
 */
const DOMAIN_IMAGES: Record<string, string> = {
  Networking: "photo-1558494949-ef010cbdcc31",
  "Data Center": "photo-1591808216268-ce0b82787efe",
  Security: "photo-1550751827-4bd374c3f58b",
  DevOps: "photo-1517694712202-14dd9538aa97",
  Business: "photo-1552581234-26160f608093",
  Systems: "photo-1629654297299-c8506221ca97",
  Cloud: "photo-1451187580459-43490279c0fa",
  Productivity: "photo-1552664730-d307ca884978",
  "Data & AI": "photo-1518186285589-2f7649de83e0",
  Architecture: "photo-1486718448742-163732cd1544",
};

const FALLBACK = "photo-1573164713988-8665fc963095";

export function domainImageFor(group: string, width = 600): string {
  const id = DOMAIN_IMAGES[group] ?? FALLBACK;
  return `https://images.unsplash.com/${id}?w=${width}&q=70&auto=format&fit=crop`;
}
