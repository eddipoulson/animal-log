<script>
	import DateSelector from '$lib/Animals/DateSelector.svelte';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let formLoading = $state(false);
</script>

<svelte:head>
	<title>Edit {data.animal.name}</title>
</svelte:head>

<div class="mx-auto max-w-xl">
	<header class="mb-5">
		<p class="text-sm font-bold text-emerald-700">Animal settings</p>
		<h1 class="mt-1 font-lora text-3xl font-semibold">Edit {data.animal.name}</h1>
	</header>
	<section class="surface p-5 sm:p-6">
		<form
			method="post"
			action="?/edit"
			class="flex flex-col gap-5"
			use:enhance={() => {
				formLoading = true;
				return ({ update }) => update().finally(() => (formLoading = false));
			}}
		>
			<div>
				<label for="description" class="mb-1.5 block text-sm font-bold text-stone-700">Species or type</label>
				<input id="description" name="description" value={data.animal.description} type="text" placeholder="Type of animal" class="field" required disabled={formLoading} />
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="quantity" class="mb-1.5 block text-sm font-bold text-stone-700">How many?</label>
					<input id="quantity" name="quantity" type="number" min="1" max="10000" value={data.animal.quantity} class="field" required disabled={formLoading} />
				</div>
				<div>
					<label for="habitat" class="mb-1.5 block text-sm font-bold text-stone-700">Tank or habitat</label>
					<select id="habitat" name="habitat" class="field" value={data.animal.habitat} disabled={formLoading}>
						<option value="">No tank assigned</option>
						{#each data.habitats as habitat (habitat.id)}
							<option value={habitat.id}>{habitat.name}</option>
						{/each}
					</select>
				</div>
			</div>
			<div>
				<p class="mb-1.5 text-sm font-bold text-stone-700">Feed days</p>
				<DateSelector loading={formLoading} selectedDays={data.animal.dates} />
			</div>
			<button type="submit" class="primary-button w-full" disabled={formLoading}>
				{formLoading ? 'Saving...' : `Update ${data.animal.name}`}
			</button>
			{#if form?.error}
				<p class="text-sm text-red-700" role="alert">{form.error}</p>
			{/if}
		</form>
	</section>
</div>
