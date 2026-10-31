import "server-only";

import { isDemoModeEnabled } from "@/lib/demo-mode";

export const demoModeEnabled = isDemoModeEnabled(process.env);
