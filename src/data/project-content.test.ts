import { describe, it, expect } from "vitest";
import { getProjectCopy } from "@data/project-content";

const LANGS = ["es", "en", "it"];
const SLUGS = ["triba", "sp-soluciones-textiles", "multiservizi"];

describe("getProjectCopy", () => {
  it("returns the full copy for every slug in every language", () => {
    for (const lang of LANGS) {
      for (const slug of SLUGS) {
        const copy = getProjectCopy(slug, lang);
        expect(copy.title, `${lang}/${slug} title`).not.toBe("");
        expect(copy.description, `${lang}/${slug} description`).not.toBe("");
        expect(copy.subtitle, `${lang}/${slug} subtitle`).not.toBe("");
        expect(copy.challenge, `${lang}/${slug} challenge`).not.toBe("");
        expect(copy.solution, `${lang}/${slug} solution`).not.toBe("");
      }
    }
  });

  it("throws in dev for an unknown slug instead of returning a silent ''", () => {
    expect(() => getProjectCopy("proyecto-inexistente", "es")).toThrow(/caseStudies/);
    expect(() => getProjectCopy("triba", "de")).toThrow(/caseStudies/);
  });
});