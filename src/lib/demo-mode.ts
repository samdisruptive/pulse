type DemoModeEnvironment = {
  DEMO_DATA?: string;
  NODE_ENV?: string;
};

export function isDemoModeEnabled(environment: DemoModeEnvironment): boolean {
  const requested = environment.DEMO_DATA === "true";

  if (requested && environment.NODE_ENV === "production") {
    throw new Error("DEMO_DATA cannot be enabled in production.");
  }

  return requested;
}
