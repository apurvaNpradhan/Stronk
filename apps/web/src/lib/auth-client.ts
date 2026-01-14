import type { auth } from "@stronk/auth";
import { env } from "@stronk/env/web";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
	baseURL: env.VITE_SERVER_URL,
	plugins: [inferAdditionalFields<typeof auth>()],
});

export const sessionQueryOptions = {
	queryKey: ["session"],
	queryFn: () => authClient.getSession(),
	staleTime: 5 * 60 * 1000,
};
