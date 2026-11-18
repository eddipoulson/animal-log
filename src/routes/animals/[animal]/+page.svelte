<script>
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { Utensils, Pencil, Trash2, Plus } from 'lucide-svelte';
	import { formatDateTime } from '$lib/dates.js';

	let { data, form } = $props();

	function openRemove() {
		document.getElementById('delete-animal').showModal();
	}

	function closeRemove() {
		document.getElementById('delete-animal').close();
	}

</script>

<svelte:head>
	<title>{data.name}'s Info</title>
</svelte:head>

<div class="mx-auto max-w-xl">
	<!--- MODAL FOR REMOVING ANIMAL -->
	<dialog id="delete-animal" class="m-auto rounded-2xl border border-stone-200 p-0 shadow-xl backdrop:bg-stone-950/30">
		<div class="w-[min(22rem,calc(100vw-2rem))] p-6">
			<span class="font-lora text-xl font-semibold">Remove {data.name}?</span>
			<p class="mt-2 text-sm text-stone-500">
				This permanently removes this animal and its feeding history.
			</p>
			<form method="POST" action="?/deleteAnimal" class="mt-5 grid grid-cols-2 gap-2">
				<button type="submit"
					class="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"
				>
					Remove
				</button>
				<button type="button"
					class="secondary-button"
					onclick={closeRemove}
				>
					Cancel
				</button>
			</form>
		</div>
	</dialog>
	<!-------------------------------->
	{#if form?.error}
		<p class="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{form.error}</p>
	{/if}
	<header class="mb-5 flex items-start justify-between gap-4">
		<div>
			<p class="text-sm font-bold text-emerald-700">Animal profile</p>
			<h1 class="mt-1 font-lora text-3xl font-semibold">{data.name}</h1>
			<p class="mt-1 text-sm text-stone-500">
				{data.quantity > 1 ? `${data.quantity} · ` : ''}{data.description}
				{#if data.habitatName}<span> · {data.habitatName}</span>{/if}
			</p>
		</div>
	</header>
	<section class="mb-5 grid grid-cols-3 gap-2">
		<a
			href={resolve(`/animals/add-food?animal=${encodeURIComponent(data.name)}`)}
			class="primary-button px-2"
		>
			<Utensils size={16} /> Feed
		</a>
		<a
			href={resolve(`/animals/${$page.params.animal}/edit`)}
			class="secondary-button px-2"
		>
			<Pencil size={16} /> Edit
		</a>
		<button
			class="secondary-button px-2 text-red-600"
			onclick={openRemove}
		>
			<Trash2 size={16} /> Remove
		</button>
	</section>
	{#await data.feedings}
		<div class="surface h-32 animate-pulse bg-stone-100"></div>
	{:then feedings}
		{#if feedings.length > 0}
			<div class="surface p-4 sm:p-5">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="font-lora text-xl font-semibold">Feeding history</h2>
					<span class="text-sm text-stone-400">{feedings.length} entries</span>
				</div>
				<section class="flex flex-col divide-y divide-stone-100">
					{#each feedings as food (food.id)}
						<div class="flex items-center justify-between gap-3 py-3">
							<div class="flex min-w-0 items-center gap-3">
								<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Utensils size={16} /></div>
								<div class="min-w-0">
									<p class="truncate font-bold text-stone-800">{food.food}</p>
									<p class="text-sm text-stone-500">
										{formatDateTime(food.fed)}{#if food.fedBy} · Logged by {food.fedBy}{/if}
									</p>
								</div>
							</div>
							<form method="POST" action="?/removeFeeding">
								<input type="hidden" name="id" value={food.id} />
								<button type="submit" aria-label="Remove feeding" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600">
									<Trash2 size={16} />
								</button>
							</form>
						</div>
					{/each}
				</section>
			</div>
		{:else}
			<div class="surface flex flex-col items-center py-12 text-center">
				<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Utensils size={22} /></div>
				<h2 class="font-lora text-xl font-semibold">No feedings yet</h2>
				<p class="mt-1 text-sm text-stone-500">Log the next meal to start the history.</p>
				<a href={resolve(`/animals/add-food?animal=${encodeURIComponent(data.name)}`)} class="primary-button mt-5"><Plus size={16} /> Add feeding</a>
			</div>
		{/if}
	{/await}
</div>
