import type { Context as ApiContext } from "@lumen-health/api/context";
import { db } from "./services";


import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext(_options: CreateContextOptions): Promise<ApiContext> {
	return {
    db,
	};
}


export type Context = Awaited<ReturnType<typeof createContext>>;
