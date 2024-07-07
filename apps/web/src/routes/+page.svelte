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
