# SvelteKit Turbo Environment Variables Repro

The default Turbo environment variables patterns do not work in SvelteKit v2.0. Turbo uses `VITE_*` but SvelteKit uses `PUBLIC_*` and `PRIVATE_*`.

## Instructions

> [!NOTE] tl;dr
> See the Vercel app comments in these PRs for more details:

Follow these steps to demonstrate the issue.

1. Run `npx create-turbo@latest -e with-svelte`
2. Install `@sveltejs/adapter-vercel` and update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
```

3. Add environment variables to `apps/web/.env` (this file is not in source control):

```env
PUBLIC_STATIC="abc123"
PRIVATE_STATIC="def456"
```

3. Import `PUBLIC_STATIC` to `apps/web/src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import { PUBLIC_STATIC } from '$env/static/public';
	import { MyCounterButton } from '@repo/ui';

	export let data;
</script>

<h1>Turbo Env Var Repro</h1>
<MyCounterButton />
<p>Environment variables:</p>
<pre>
{JSON.stringify(
		{
			...data,
			PUBLIC_STATIC: `Imported on the client from $env/static/public: ${PUBLIC_STATIC}`
		},
		null,
		2
	)}
</pre>
```

4. Import `PRIVATE_STATIC` to `apps/web/src/routes/api/index.ts`:

```svelte
import { PRIVATE_STATIC } from '$env/static/private';

export function load() {
	return {
		PRIVATE_STATIC: `Loaded on the server from $env/static/private: ${PRIVATE_STATIC}`
	};
}
```

5. Run `pnpm dev` in `apps/web`. Open in the browser. The env vars are displayed as expected.

6. Deploy to Vercel. The build will fail with an error similar to:

```sh
web:build: error during build:
web:build: RollupError: "PUBLIC_STATIC" is not exported by "virtual:$env/static/public", imported by "src/routes/+page.svelte".
web:build: file: /vercel/path0/apps/web/src/routes/+page.svelte:2:10
web:build: 1: <script lang="ts">
web:build: 2:   import { PUBLIC_STATIC } from '$env/static/public';
web:build:               ^
web:build: 3:   import { env } from '$env/dynamic/public';
web:build: 4:   import { MyCounterButton } from '@repo/ui';
```

7. Update `turbo.json` to include `PUBLIC_*` and `PRIVATE_*` in the `env` array:

```json
{
	"$schema": "https://turbo.build/schema.json",
	"tasks": {
		"build": {
			"dependsOn": ["^build"],
			"inputs": ["$TURBO_DEFAULT", ".env*"],
			"outputs": [".svelte-kit/**", ".vercel/**"],
			"env": ["PUBLIC_*", "PRIVATE_*"]
		},
		"lint": {},
		"dev": {
			"cache": false,
			"persistent": true
		}
	}
}
```

8. Redeploy to Vercel. The build will succeed.
