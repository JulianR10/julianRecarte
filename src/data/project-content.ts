import es from "@i18n/es.json";
import en from "@i18n/en.json";
import it from "@i18n/it.json";

type Lang = "es" | "en" | "it";

const translations: Record<Lang, typeof es> = { es, en, it };

export interface ProjectCopy {
  title: string;
  subtitle: string;
  description: string;
  challengeTitle: string;
  challenge: string;
  solutionTitle: string;
  solution: string;
  plusTitle?: string;
  plus?: string;
  adminPanel?: {
    badges: string[];
  };
}

export function getProjectCopy(slug: string, lang: string): ProjectCopy {
  const dict = translations[lang as Lang];
  const caseStudies = dict?.caseStudies as unknown as Record<string, ProjectCopy | undefined> | undefined;
  const raw = caseStudies?.[slug];

  if (raw && raw.title) return raw;

  if (import.meta.env.DEV) {
    throw new Error(`[project-content] Falta caseStudies."${slug}" para lang "${lang}"`);
  }

  return {
    title: slug,
    subtitle: "",
    description: "",
    challengeTitle: "",
    challenge: "",
    solutionTitle: "",
    solution: "",
    plusTitle: "",
    plus: "",
  };
}
