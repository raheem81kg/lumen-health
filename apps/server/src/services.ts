import { ENV } from "./env.server";
import { createDb } from "@lumen-health/db";

export const db = createDb(ENV);
