# SvelteKit Turbo Environment Variables Repro

The default Turbo environment variables patterns do not work in SvelteKit v2.0. Turbo has `VITE_*` for SvelteKit, but SvelteKit uses `PUBLIC_*` as the default prefix for public env vars.

> [!TIP]
> Turbo framework inference should use `PUBLIC_*` as the default prefix for env vars.
> Framework inference documentation should stress that variables not included in the framework defaults or explicitly in `turbo.json` will not be available for the build.

There is no prefix for private env vars. SvelteKit default is that anything not prefixed with `PUBLIC_` is private and can be used in routes. However, this means private env vars must be listed explicitly in `turbo.json` in the `env` array.

## Instructions

> [!NOTE]
> See [this PR](https://github.com/jacksteamdev/svelte-env-var-repro/pull/1) for an issue demo.

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
PUBLIC_ENV_VAR="abc123"
SECRET_ENV_VAR="def456"
```

3. Import `PUBLIC_ENV_VAR` to `apps/web/src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import { PUBLIC_ENV_VAR } from '$env/static/public';
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
			PUBLIC_ENV_VAR: `Imported on the client from $env/static/public: ${PUBLIC_ENV_VAR}`
		},
		null,
		2
	)}
</pre>
```

4. Import `SECRET_ENV_VAR` to `apps/web/src/routes/api/index.ts`:

```svelte
import { SECRET_ENV_VAR } from '$env/static/private';

export function load() {
	return {
		SECRET_ENV_VAR: `Loaded on the server from $env/static/private: ${SECRET_ENV_VAR}`
	};
}
```

5. Run `pnpm dev` in `apps/web`. Open in the browser. The env vars are displayed as expected.

6. Deploy to Vercel. The build will fail with an error similar to:

```sh
web:build: error during build:
web:build: RollupError: "PUBLIC_ENV_VAR" is not exported by "virtual:$env/static/public", imported by "src/routes/+page.svelte".
web:build: file: /vercel/path0/apps/web/src/routes/+page.svelte:2:10
web:build: 1: <script lang="ts">
web:build: 2:   import { PUBLIC_ENV_VAR } from '$env/static/public';
web:build:               ^
web:build: 3:   import { env } from '$env/dynamic/public';
web:build: 4:   import { MyCounterButton } from '@repo/ui';
```

1. Add `PUBLIC_ENV_VAR` and `SECRET_ENV_VAR` to the Vercel project settings UI. Redeploy the project. The build will fail with the same error.

2. Update `turbo.json` to include `PUBLIC_*` and `PRIVATE_*` in the `env` array:

```json
{
	"$schema": "https://turbo.build/schema.json",
	"tasks": {
		"build": {
			"dependsOn": ["^build"],
			"inputs": ["$TURBO_DEFAULT", ".env*"],
			"outputs": [".svelte-kit/**", ".vercel/**"],
			"env": ["PUBLIC_*", "SECRET_ENV_VAR"]
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

## Resources

1. Discord thread: https://discord.com/channels/457912077277855764/1258475334744014859
2. SvelteKit documentation for default env var prefixes:
   1. Config: https://kit.svelte.dev/docs/configuration#env
   2. Public: https://learn.svelte.dev/tutorial/env-static-public
   3. Private: https://learn.svelte.dev/tutorial/env-static-private
3. Turbo docs for environment variables:
   1. Tasks must account for all env vars: https://turbo.build/repo/docs/crafting-your-repository/using-environment-variables#strict-mode
   2. Add env vars to turbo.json: https://turbo.build/repo/docs/crafting-your-repository/using-environment-variables#adding-environment-variables-to-task-hashes
   3. Don't set env vars at runtime: https://turbo.build/repo/docs/crafting-your-repository/using-environment-variables#avoid-creating-or-mutating-environment-variables-at-runtime
   4. Config docs: https://turbo.build/repo/docs/reference/configuration#env
