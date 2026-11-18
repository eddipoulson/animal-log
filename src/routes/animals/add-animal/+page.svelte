<script>
	import DateSelector from '$lib/Animals/DateSelector.svelte';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();
	let formLoading = $state(false);
</script>

<svelte:head>
	<title>Add an animal group</title>
</svelte:head>

<div class="mx-auto max-w-xl">
	<header class="mb-5">
		<p class="text-sm font-bold text-emerald-700">New care group</p>
		<h1 class="mt-1 font-lora text-3xl font-semibold">Add animals</h1>
		<p class="mt-1 text-sm text-stone-500">Log a whole tank group together instead of adding each animal separately.</p>
	</header>
	<section class="surface p-5 sm:p-6">
		<form
			method="post"
			action="?/add"
			class="flex flex-col gap-5"
			use:enhance={() => {
				formLoading = true;
				return ({ update }) => update().finally(() => (formLoading = false));
			}}
		>
			<div>
				<label for="name" class="mb-1.5 block text-sm font-bold text-stone-700">Group name</label>
				<input id="name" name="name" type="text" placeholder="e.g. Tree frogs" class="field" required disabled={formLoading} />
			</div>
			<div>
				<label for="description" class="mb-1.5 block text-sm font-bold text-stone-700">Species or type</label>
				<input id="description" name="description" type="text" placeholder="e.g. Red-eyed tree frog" class="field" required disabled={formLoading} />
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="quantity" class="mb-1.5 block text-sm font-bold text-stone-700">How many?</label>
					<input id="quantity" name="quantity" type="number" min="1" max="10000" value="1" class="field" required disabled={formLoading} />
				</div>
				<div>
					<label for="habitat" class="mb-1.5 block text-sm font-bold text-stone-700">Tank or habitat</label>
					<select id="habitat" name="habitat" class="field" disabled={formLoading}>
						<option value="">No tank assigned</option>
						{#each data.habitats as habitat (habitat.id)}
							<option value={habitat.id}>{habitat.name}</option>
						{/each}
					</select>
					<a href={resolve('/animals/tanks')} class="mt-1 inline-block text-xs font-semibold text-emerald-700 hover:underline">Manage tanks</a>
				</div>
			</div>
			<div>
				<p class="mb-1.5 text-sm font-bold text-stone-700">Feed days</p>
				<DateSelector loading={formLoading} />
			</div>
			<button type="submit" class="primary-button w-full" disabled={formLoading}>
				{formLoading ? 'Adding animal...' : 'Add animal'}
			</button>
			{#if form?.error}
				<p class="text-sm text-red-700" role="alert">{form.error}</p>
			{/if}
		</form>
	</section>
</div>
