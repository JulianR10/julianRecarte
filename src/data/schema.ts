/**
 * schema.ts — builders de JSON-LD (schema.org) para GEO/SEO.
 *
 * Cada función devuelve un objeto listo para serializar en un <script
 * type="application/ld+json">. El `Person` y el `Article` viven en Layout.astro;
 * el resto se inyecta por página vía la prop `schema` de Layout.
 */

const SITE = "https://julianrecarte.dev";

export interface ServiceItem {
  title: string;
  description: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

const LANGUAGES = [
  { "@type": "Language", "name": "Spanish", "alternateName": "es" },
  { "@type": "Language", "name": "English", "alternateName": "en" },
  { "@type": "Language", "name": "Italian", "alternateName": "it" },
];

/** WebSite del idioma actual, ligado al Person por @id. */
export function websiteSchema(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/${lang}/#website`,
    url: `${SITE}/${lang}/`,
    name: "Julián Recarte",
    inLanguage: lang,
    publisher: { "@id": `${SITE}/#person` },
  };
}

/** Página "Sobre mí" como AboutPage, ligada a la entidad Person por @id. */
export function aboutPageSchema({
  lang,
  name,
  description,
  path,
}: {
  lang: string;
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE}${path}#about`,
    url: `${SITE}${path}`,
    name,
    description,
    inLanguage: lang,
    isPartOf: { "@id": `${SITE}/${lang}/#website` },
    mainEntity: { "@id": `${SITE}/#person` },
    about: { "@id": `${SITE}/#person` },
  };
}

/** Servicio profesional (freelance remoto) con las soluciones ofrecidas. */
export function professionalServiceSchema({
  lang,
  jobTitle,
  bio,
  services,
}: {
  lang: string;
  jobTitle: string;
  bio: string;
  services: ServiceItem[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE}/#service`,
    name: `Julián Recarte — ${jobTitle}`,
    description: bio,
    url: `${SITE}/${lang}/`,
    image: `${SITE}/og-cover.jpg`,
    provider: { "@id": `${SITE}/#person` },
    areaServed: "Worldwide",
    availableLanguage: LANGUAGES,
    email: "julianrecarteweb@gmail.com",
    sameAs: [
      "https://github.com/JulianR10",
      "https://www.linkedin.com/in/julianrecarte/",
    ],
    makesOffer: services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        description: s.description,
      },
    })),
  };
}

/** Lista de proyectos con página de caso de estudio. */
export function projectsItemList(
  lang: string,
  projects: { title: string; slug: string; description: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Proyectos",
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.title,
      description: p.description,
      url: `${SITE}/${lang}/proyectos/${p.slug}/`,
    })),
  };
}

/** Reseñas reales mostradas en el sitio (sin agregado inventado). */
export function reviewsSchema(items: { quote: string; name: string }[]) {
  return items.map((t) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    author: { "@type": "Person", name: t.name },
    reviewBody: t.quote,
    itemReviewed: { "@id": `${SITE}/#service` },
    reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
  }));
}

/** FAQPage a partir de preguntas visibles en la página. */
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** BreadcrumbList simple de dos niveles (Inicio → página). */
export function breadcrumbSchema({
  lang,
  homeLabel,
  name,
  path,
}: {
  lang: string;
  homeLabel: string;
  name: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: `${SITE}/${lang}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: `${SITE}${path}`,
      },
    ],
  };
}
