import { describe, it, expect } from "vitest";
import { getProjectCopy } from "@data/project-content";

const LANGS = ["es", "en", "it"];
const SLUGS = ["triba", "sp-soluciones-textiles", "multiservizi"];

describe("getProjectCopy", () => {
  it("returns the card copy (title/description/subtitle) for every slug in every language", () => {
    for (const lang of LANGS) {
      for (const slug of SLUGS) {
        const copy = getProjectCopy(slug, lang);
        expect(copy.title, `${lang}/${slug} title`).not.toBe("");
        expect(copy.description, `${lang}/${slug} description`).not.toBe("");
        expect(copy.subtitle, `${lang}/${slug} subtitle`).not.toBe("");
      }
    }
  });

  it("returns full case-study copy only for launched projects", () => {
    for (const lang of LANGS) {
      const triba = getProjectCopy("triba", lang);
      expect(triba.challenge, `${lang}/triba challenge`).not.toBe("");
      expect(triba.solution, `${lang}/triba solution`).not.toBe("");

      const sp = getProjectCopy("sp-soluciones-textiles", lang);
      expect(sp.challenge, `${lang}/sp challenge`).toBeFalsy();
      expect(sp.solution, `${lang}/sp solution`).toBeFalsy();

      const multi = getProjectCopy("multiservizi", lang);
      expect(multi.challenge, `${lang}/multi challenge`).toBeFalsy();
      expect(multi.solution, `${lang}/multi solution`).toBeFalsy();
    }
  });

  it("throws in dev for an unknown slug instead of returning a silent ''", () => {
    expect(() => getProjectCopy("proyecto-inexistente", "es")).toThrow(/caseStudies/);
    expect(() => getProjectCopy("triba", "de")).toThrow(/caseStudies/);
  });
});