import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

// The Docker image resolves the env at boot through varlock/auto-load
const withVarlock = varlockNextConfigPlugin({ freezeIntoBundle: false });
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	output: "standalone",
	};

export default withVarlock(nextConfig);

