<script lang="ts">
	import { PUBLIC_STATIC } from '$env/static/public';
	import { env } from '$env/dynamic/public';
	import { MyCounterButton } from '@repo/ui';

	export let data;
</script>

<h1>Web</h1>
<MyCounterButton />
<p>Environment variables:</p>
<pre>
{JSON.stringify(
		{
			...data,
			PUBLIC_STATIC: `Imported on the client from $env/static/public: ${PUBLIC_STATIC}`,
			PUBLIC_DYNAMIC: `Imported on the client from $env/dynamic/public: ${env.PUBLIC_DYNAMIC}`
		},
		null,
		2
	)}
</pre>
