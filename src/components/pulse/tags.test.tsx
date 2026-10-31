import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Delta, TierTag } from "./tags";

describe("Pulse tags", () => {
  it("labels a tier and a judgement", () => {
    render(
      <>
        <TierTag tier="google" />
        <Delta judgement="better" text="▲ 8.2%" />
      </>,
    );

    expect(screen.getByText("Google-reported")).toBeInTheDocument();
    expect(screen.getByText("▲ 8.2%")).toBeInTheDocument();
  });
});