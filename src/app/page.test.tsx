import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("identifies the Pulse application", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Pulse" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Digitally Disruptive")).toBeInTheDocument();
  });
});
