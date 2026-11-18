<script>
	import '../app.css';
	import Navbar from '$lib/Navbar.svelte';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<div class="app-shell flex min-h-dvh flex-col text-stone-900">
	<Navbar />
	<main class="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
		{@render children?.()}
	</main>
</div>
