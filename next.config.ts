import type { NextConfig } from "next";

import { isDemoModeEnabled } from "./src/lib/demo-mode";

isDemoModeEnabled(process.env);

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
