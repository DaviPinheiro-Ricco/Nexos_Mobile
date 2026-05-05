export type { FormQuestion as Question } from "./forms";
import { FORMS, calcFormScore } from "./forms";

export const SPI_QUESTIONS = FORMS[0].questions;

export function calcScore(respostas: Record<number, number>): number {
  return calcFormScore(respostas);
}

export function getClassification(score: number) {
  const cls = FORMS[0].classify(score);
  return {
    classification: cls.label,
    color: cls.color,
    bgColor: cls.bgColor,
    level: (cls.level === "low" ? "none" : cls.level === "medium" ? "mild" : "severe") as "none" | "mild" | "severe",
  };
}
