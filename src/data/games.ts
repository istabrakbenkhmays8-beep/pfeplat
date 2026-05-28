/**
 * Hand-crafted game-course content. Each game is a sequence of "challenges" — a prompt with
 * 3-4 choices and an explanation that's revealed AFTER the user picks. Different from the
 * Assessment engine (which is graded once + recorded as AssessmentResult); games are short,
 * playful, replayable for practice, and award coins on first completion.
 *
 * Each game is keyed by a course code that exists in the catalog. The game's coinReward
 * comes from the matching Course doc.
 */
export type GameChallenge = {
  prompt: string;
  options: Array<{ text: string; isCorrect: boolean; explainOnPick?: string }>;
  /** Shown to the user AFTER they answer (right or wrong). */
  reveal: string;
};

export type Game = {
  code: string;
  title: string;
  intro: string;
  challenges: GameChallenge[];
};

export const GAMES: Game[] = [
  {
    code: "CCNA",
    title: "Networking 101 challenge",
    intro:
      "Five quick networking puzzles. Pick fast — you earn points for correct answers and learn from every one.",
    challenges: [
      {
        prompt: "You ping 8.8.8.8 and it works, but ping google.com fails. The most likely culprit is…",
        options: [
          { text: "Your default gateway is down", isCorrect: false },
          { text: "DNS resolution is broken", isCorrect: true },
          { text: "Your subnet mask is wrong", isCorrect: false },
          { text: "The remote server is offline", isCorrect: false },
        ],
        reveal:
          "When numeric IPs work but hostnames don't, DNS is almost always the issue. Check /etc/resolv.conf or your DHCP-provided DNS.",
      },
      {
        prompt: "Which switching protocol prevents loops by blocking redundant links?",
        options: [
          { text: "OSPF", isCorrect: false },
          { text: "STP (Spanning Tree)", isCorrect: true },
          { text: "BGP", isCorrect: false },
          { text: "DHCP", isCorrect: false },
        ],
        reveal:
          "STP elects a root bridge and blocks ports on redundant paths until they're needed. RSTP and MSTP are faster modern variants.",
      },
      {
        prompt: "A /27 IPv4 subnet has how many usable host addresses?",
        options: [
          { text: "14", isCorrect: false },
          { text: "30", isCorrect: true },
          { text: "32", isCorrect: false },
          { text: "62", isCorrect: false },
        ],
        reveal:
          "/27 = 32 addresses total. Subtract the network and broadcast addresses → 30 usable hosts.",
      },
      {
        prompt: "Which command shows the routing table on a Cisco router?",
        options: [
          { text: "show interfaces", isCorrect: false },
          { text: "show ip route", isCorrect: true },
          { text: "show running-config", isCorrect: false },
          { text: "show vlan", isCorrect: false },
        ],
        reveal:
          "`show ip route` is your daily-driver command. Combined with `traceroute`, it answers 80% of routing questions.",
      },
      {
        prompt: "On which OSI layer does a switch primarily operate?",
        options: [
          { text: "Layer 1 — Physical", isCorrect: false },
          { text: "Layer 2 — Data Link", isCorrect: true },
          { text: "Layer 3 — Network", isCorrect: false },
          { text: "Layer 4 — Transport", isCorrect: false },
        ],
        reveal:
          "Switches forward frames using MAC addresses — that's the Data Link layer. Layer-3 switches add routing on top.",
      },
    ],
  },
  {
    code: "AZ-104",
    title: "Azure speedrun",
    intro:
      "Five rapid-fire Azure scenarios. Each answer comes with a short explanation so you keep learning.",
    challenges: [
      {
        prompt: "You need to give a VM access to a Storage account without storing credentials. You use…",
        options: [
          { text: "A service principal with a client secret", isCorrect: false },
          { text: "A managed identity", isCorrect: true },
          { text: "An SAS token in the VM's environment file", isCorrect: false },
          { text: "Storing the key in Azure Key Vault", isCorrect: false },
        ],
        reveal:
          "Managed identities are the recommended approach — Azure issues + rotates the token for you. No secrets in code or VM.",
      },
      {
        prompt: "Which Azure service offers serverless event-driven compute?",
        options: [
          { text: "Azure Virtual Machines", isCorrect: false },
          { text: "Azure App Service", isCorrect: false },
          { text: "Azure Functions", isCorrect: true },
          { text: "Azure Kubernetes Service", isCorrect: false },
        ],
        reveal:
          "Azure Functions runs short bursts of code triggered by events — HTTP, queue messages, timers, blob changes, etc.",
      },
      {
        prompt: "To get the strongest SLA for a single application, deploy across…",
        options: [
          { text: "One VM with Premium SSD", isCorrect: false },
          { text: "Two VMs in the same Availability Set", isCorrect: false },
          { text: "Two VMs across Availability Zones", isCorrect: true },
          { text: "Two VMs in different regions with manual failover", isCorrect: false },
        ],
        reveal:
          "Availability Zones span physically separate datacenters in a region. Two zones → 99.99% SLA on VMs.",
      },
      {
        prompt: "Which CLI command lists your current subscriptions?",
        options: [
          { text: "az account list", isCorrect: true },
          { text: "az subscription show", isCorrect: false },
          { text: "az login --all", isCorrect: false },
          { text: "az billing list", isCorrect: false },
        ],
        reveal:
          "`az account list` shows every subscription your account can see. Switch with `az account set --subscription <id>`.",
      },
      {
        prompt: "Network Security Groups are evaluated in which order?",
        options: [
          { text: "Top to bottom, last rule wins", isCorrect: false },
          { text: "By priority — lowest number first, first match wins", isCorrect: true },
          { text: "Random, governed by Azure's load balancer", isCorrect: false },
          { text: "Outbound rules first, then inbound", isCorrect: false },
        ],
        reveal:
          "NSG rules use numeric priority (100–4096). Azure evaluates from low to high — the first match decides.",
      },
    ],
  },
];

export function getGame(code: string): Game | undefined {
  return GAMES.find((g) => g.code.toUpperCase() === code.toUpperCase());
}

export const GAME_CODES = GAMES.map((g) => g.code);
