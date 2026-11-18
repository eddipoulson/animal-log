<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { getDayOfWeek, timeSince } from '$lib/dates.js';
	import { resolve } from '$app/paths';
	import { PawPrint, Plus, RotateCcw, Utensils, PanelsTopLeft } from 'lucide-svelte';

	let { data, form } = $props();
	let animals = $derived(data.animals);
	let lastFeedings = $derived(data.lastFeedings);
	let todayName = $state('');
	let animalSections = $derived.by(() => {
		const sections = Object.create(null);
		for (const animal of animals) {
			const sectionId = animal.habitatId || 'unassigned';
			if (!sections[sectionId]) {
				sections[sectionId] = {
					id: sectionId,
					name: animal.habitatName || 'Tank',
					animals: []
				};
			}
			sections[sectionId].animals.push(animal);
		}
		return Object.values(sections).sort((a, b) =>
			a.id === 'unassigned' ? -1 : b.id === 'unassigned' ? 1 : a.name.localeCompare(b.name)
		);
	});

	onMount(() => {
		todayName = getDayOfWeek(new Date());
	});
</script>

<svelte:head>
	<title>Animals</title>
</svelte:head>

<div class="flex flex-col gap-5">
	<header class="flex items-center justify-between gap-3">
		<div>
			<p class="text-sm font-semibold text-emerald-700">Your collection</p>
			<h1 class="mt-1 font-lora text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Animals</h1>
			<p class="mt-1 text-sm text-stone-500">Groups, schedules, and feeding history.</p>
		</div>
		<a href={resolve('/animals/add-animal')} class="primary-button shrink-0 px-3 text-xs sm:px-4 sm:text-sm" aria-label="Add animal group">
			<Plus size={18} /> Add group
		</a>
	</header>
	{#if form?.error}
		<p class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{form.error}</p>
	{/if}
	{#if animals.length > 0}
		<section class="grid gap-3">
			<div class="flex items-center justify-between">
				<h2 class="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Animal groups</h2>
				<span class="text-sm text-stone-400">{animals.length} {animals.length === 1 ? 'group' : 'groups'}</span>
			</div>
			{#each animalSections as section (section.id)}
				<div class="grid gap-3 lg:grid-cols-2">
					{#if section.id !== 'unassigned'}
						<h3 class="mt-2 flex items-center gap-2 text-sm font-bold text-stone-600 lg:col-span-2">
							<PanelsTopLeft size={15} class="text-emerald-700" /> {section.name}
						</h3>
					{/if}
					{#each section.animals as animal (animal.id)}
						<article class="surface p-4 transition-shadow hover:shadow-[0_12px_35px_rgb(28_25_23/0.10)]">
							<a href={resolve(`/animals/${animal.id}`)} class="group flex min-w-0 items-start gap-3">
								<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
									<PawPrint size={24} strokeWidth={2} />
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex flex-wrap items-center gap-2">
										<h3 class="font-lora text-xl font-semibold text-stone-900 group-hover:text-emerald-800">{animal.name}</h3>
										{#if !animal.habitatId}
											<span class="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">No tank</span>
										{/if}
									</div>
									<p class="text-sm text-stone-500">{animal.quantity > 1 ? `${animal.quantity} · ` : ''}{animal.description}</p>
									<div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-600">
										<Utensils size={15} class="text-stone-400" />
										{#if lastFeedings[animal.id]}
											<span>Last fed {#if lastFeedings[animal.id].food} <strong class="text-stone-800">{lastFeedings[animal.id].food}</strong>{/if}</span>
											<span class="text-stone-400">· {timeSince(lastFeedings[animal.id].fed)}</span>
										{:else}
											<span class="text-stone-400">No feeds logged</span>
										{/if}
									</div>
								</div>
							</a>
							<div class="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-stone-100 pt-3">
								<div>
									<p class="mb-1.5 text-[11px] font-semibold text-stone-400">Feeding days</p>
									{#if (animal.dates ?? []).length > 0}
										<div class="flex flex-wrap gap-1.5">
											{#each animal.dates as date (date)}
												<span class="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold {date === todayName ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-500'}">
													{date.substring(0, 2)}
												</span>
											{/each}
										</div>
									{:else}
										<p class="py-2 text-xs text-stone-400">No schedule set</p>
									{/if}
								</div>
								<div class="flex flex-wrap gap-2">
									<a href={resolve(`/animals/add-food?animal=${encodeURIComponent(animal.name)}`)} class="primary-button">
										<Plus size={16} /> Add feed
									</a>
									{#if lastFeedings[animal.id]?.food}
										<form method="POST" action="?/repeatLast" use:enhance>
											<input type="hidden" name="animal" value={animal.id} />
											<button type="submit" class="secondary-button">
												<RotateCcw size={16} /> Repeat last
											</button>
										</form>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/each}
		</section>
	{:else}
		<section class="surface flex flex-col items-center px-6 py-14 text-center">
			<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
				<PawPrint size={30} />
			</div>
			<h2 class="font-lora text-2xl font-semibold">No animal groups yet</h2>
			<p class="mt-2 max-w-sm text-sm text-stone-500">Create a group for one animal or several of the same kind, then add a schedule and feeding history.</p>
			<a href={resolve('/animals/add-animal')} class="primary-button mt-6"><Plus size={18} /> Add an animal group</a>
		</section>
	{/if}
</div>
