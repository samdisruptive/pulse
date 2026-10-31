import { describe, expect, it } from "vitest";

import tokens from "../../docs/reference/pulse-design-tokens.json";
import { contrastRatio } from "./contrast";

type Theme = "light" | "dark";

function token(name: string, theme: Theme): string {
  const match = tokens.color.tokens.find((item) => item.name === name);
  if (!match) throw new Error(`Missing token ${name}`);
  return match.value[theme];
}

describe("token contrast", () => {
  it.each(["light", "dark"] as const)(
    "meets AA for key text pairs in %s",
    (theme) => {
      expect(contrastRatio(token("ink-muted", theme), token("surface", theme))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(token("accent", theme), token("surface", theme))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(token("on-accent", theme), token("accent-fill", theme))).toBeGreaterThanOrEqual(4.5);
    },
  );
});
