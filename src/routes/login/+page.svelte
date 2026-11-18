<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>CritterCare</title>
</svelte:head>
<div class="mx-auto flex min-h-[70dvh] max-w-md flex-col justify-center py-8">
	<hgroup class="mb-7 text-center">
		<p class="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">CritterCare</p>
		<h1 class="font-lora text-4xl font-semibold tracking-tight text-stone-900">Welcome back</h1>
		<p class="mt-2 text-stone-500">Keep every feeding and schedule in one place.</p>
	</hgroup>
	<div class="surface p-5 sm:p-6">
		{#if data.providers?.length > 0}
			<form method="post" class="grid gap-3">
				{#each data.providers as provider (provider.name)}
					<button formaction="?/{provider.name}" class="secondary-button w-full">
						Continue with {provider.displayName}
					</button>
				{/each}
			</form>
			<div class="relative my-6">
				<div class="absolute inset-0 flex items-center"><span class="w-full border-t border-stone-200"></span></div>
				<div class="relative flex justify-center text-xs font-bold uppercase tracking-wider text-stone-400">
					<span class="bg-white px-3">or use email</span>
				</div>
			</div>
		{/if}
		<form method="post" action="?/login">
			{#if data.fail}
				<p class="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">We couldn't sign you in. Check your details and try again.</p>
			{/if}
			<div class="flex flex-col gap-4">
				<div>
					<label for="email" class="mb-1.5 block text-sm font-bold text-stone-700">Email</label>
					<input id="email" type="email" name="email" class="field" placeholder="you@example.com" required />
				</div>
				<div>
					<label for="password" class="mb-1.5 block text-sm font-bold text-stone-700">Password</label>
					<input id="password" type="password" name="password" class="field" placeholder="Enter your password" required />
				</div>
				<button type="submit" class="primary-button mt-1 w-full">Sign in</button>
			</div>
		</form>
	</div>
</div>
