type DemoModeEnvironment = {
  DEMO_DATA?: string;
  NODE_ENV?: string;
};

export function isDemoModeEnabled(environment: DemoModeEnvironment): boolean {
  if (environment.NODE_ENV === "production") {
    if (environment.DEMO_DATA === "true") {
      throw new Error("DEMO_DATA cannot be enabled in production.");
    }

    return false;
  }

  return environment.DEMO_DATA !== "false";
}
