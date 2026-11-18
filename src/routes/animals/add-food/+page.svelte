<script>
	import { onMount } from 'svelte';
	let { data, form } = $props();
	import { fromDateTimeLocal, toDateTimeLocal } from '$lib/dates.js';

	let selected = $state();
	let fedLocal = $state('');
	let isoDate = $derived(fromDateTimeLocal(fedLocal));

	onMount(() => {
		fedLocal = toDateTimeLocal(data.date);
	});
</script>

<svelte:head>
	<title>Add a feeding</title>
</svelte:head>

<div class="mx-auto max-w-xl">
	<header class="mb-5">
		<p class="text-sm font-bold text-emerald-700">Log entry</p>
		<h1 class="mt-1 font-lora text-3xl font-semibold">Add a feeding</h1>
	</header>
	<section class="surface p-5 sm:p-6">
		<form class="flex flex-col gap-5" method="post" action="?/add">
		{#if form?.error}
			<p class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{form.error}</p>
		{/if}
			<div>
				<label for="animal" class="mb-1.5 block text-sm font-bold text-stone-700">Animal</label>
			<select
					id="animal"
					class="field"
				name="animal"
				bind:value={selected}
					required
			>
				{#await data.record}
					<option disabled hidden selected>Loading...</option>
				{:then record}
					{#each record as animal (animal.id)}
						{#if data.animal && animal.name.toLowerCase() == data.animal.toLowerCase()}
							<option value={animal.id} selected>{animal.name}</option>
						{:else}
							<option value={animal.id}>{animal.name}</option>
						{/if}
					{/each}
				{/await}
			</select>
			</div>
			<div>
			<label for="food" class="mb-1.5 block text-sm font-bold text-stone-700">Food</label>
			<input
				type="text"
				name="food"
					id="food"
					class="field"
					placeholder="What did you feed?"
					required
			/>
			</div>
			<div>
			<label for="fed" class="mb-1.5 block text-sm font-bold text-stone-700">Date and time fed <span class="font-normal text-stone-400">· your local time</span></label>
			<input
					id="fed"
				name="fed_local"
				type="datetime-local"
					class="field"
				required
				bind:value={fedLocal}
			/>
			<input name="fed" type="hidden" value={isoDate} />
			</div>
			<button type="submit" class="primary-button w-full">Save feeding</button>
		</form>
	</section>
</div>
