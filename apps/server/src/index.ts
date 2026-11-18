import { ENV } from "./env.server";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "./context";
import { appRouter } from "@lumen-health/api/routers/index";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: ENV.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
	})
);



app.use(
	"/trpc/*",
	trpcServer({
		endpoint: "/trpc",
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	})
);



app.get("/", (c) => {
	return c.text("OK");
});

import { serve } from "@hono/node-server";

	serve(
		{
			fetch: app.fetch,
			port: 3000,
		},
		(info) => {
			console.log(`Server is running on http://localhost:${info.port}`);
		}
	);
