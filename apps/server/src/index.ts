import { ENV } from "./env.server";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "./context";
import { appRouter } from "@lumen-health/api/routers/index";
import { db } from "./services";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { collectDefaultMetrics, Histogram, Counter, register } from "@prometheus-io/client";

const app = new Hono();

collectDefaultMetrics();
const httpDuration = new Histogram({
	name: "http_request_duration_seconds",
	help: "HTTP request latency",
	labelNames: ["method", "route", "status"],
	buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5],
});
const httpErrors = new Counter({
	name: "http_errors_total",
	help: "HTTP 5xx responses",
	labelNames: ["route"],
});

// Game-day fault knob: FAULT_RATE env at boot, or POST /__debug/fault {"rate": 0-1} at runtime
let faultRate = Number(process.env.FAULT_RATE ?? 0);

app.use(logger());
app.use(async (c, next) => {
	const start = performance.now();
	await next();
	const route = new URL(c.req.url).pathname;
	httpDuration.labels(c.req.method, route, String(c.res.status)).observe((performance.now() - start) / 1000);
	if (c.res.status >= 500) httpErrors.labels(route).inc();
});
app.use("/trpc/*", async (c, next) => {
	if (faultRate > 0 && Math.random() < faultRate) return c.json({ error: "injected fault" }, 500);
	await next();
});
app.use(
	"/*",
	cors({
		origin: ENV.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
	})
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/ready", async (c) => {
	try {
		await db.$client`select 1`;
		return c.json({ status: "ready" });
	} catch {
		return c.json({ status: "db unreachable" }, 503);
	}
});

app.get("/version", (c) =>
	c.json({ version: process.env.APP_VERSION ?? process.env.GIT_SHA ?? "dev" })
);

app.get("/metrics", async (c) => {
	c.header("Content-Type", register.contentType);
	return c.text(await register.metrics());
});

app.post("/__debug/fault", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	if (typeof body.rate === "number" && body.rate >= 0 && body.rate <= 1) {
		faultRate = body.rate;
	}
	return c.json({ faultRate });
});

app.delete("/__debug/fault", (c) => {
	faultRate = 0;
	return c.json({ faultRate });
});



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
