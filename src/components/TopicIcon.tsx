import {
  Blocks,
  Brain,
  Cloud,
  CodeXml,
  Cpu,
  Database,
  Gauge,
  Globe,
  GraduationCap,
  Hash,
  Lightbulb,
  Palette,
  Rocket,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

// Most specific matches first ("future tech" before "tech", "web development" before "development").
const RULES: Array<[RegExp, LucideIcon]> = [
  [/\b(ai|artificial|machine learning|ml|llm|gpt|gemini|claude)\b/i, Brain],
  [/blockchain|crypto|web3|nft/i, Blocks],
  [/performance|optimi[sz]ation|speed/i, Gauge],
  [/security|cyber|privacy/i, ShieldCheck],
  [/cloud|devops|serverless|aws|azure/i, Cloud],
  [/data|database|sql|mongo/i, Database],
  [/mobile|android|ios|flutter/i, Smartphone],
  [/design|\bui\b|\bux\b|css/i, Palette],
  [/future/i, Rocket],
  [/trend|20\d\d/i, TrendingUp],
  [/innovation|idea|startup/i, Lightbulb],
  [/beginner|career|learn|education/i, GraduationCap],
  [/web/i, Globe],
  [/programming|code|coding|software|development|javascript|typescript|python|react|next/i, CodeXml],
  [/tech/i, Cpu],
];

export default function TopicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = RULES.find(([pattern]) => pattern.test(name))?.[1] ?? Hash;
  return <Icon className={className} aria-hidden />;
}
