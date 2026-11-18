<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { PanelsTopLeft, Pencil, Plus, Trash2 } from 'lucide-svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Tanks and habitats · CritterCare</title>
</svelte:head>

<div class="mx-auto flex max-w-xl flex-col gap-5">
	<header>
		<p class="text-sm font-bold text-emerald-700">Organize care</p>
		<h1 class="mt-1 font-lora text-3xl font-semibold">Tanks & habitats</h1>
		<p class="mt-1 text-sm text-stone-500">A tank can hold multiple animal groups, each with its own count and feeding schedule.</p>
	</header>

	<section class="surface p-4 sm:p-5">
		<h2 class="mb-4 font-lora text-xl font-semibold">Add a tank</h2>
		<form method="POST" action="?/add" use:enhance class="grid gap-3">
			<div>
				<label for="name" class="mb-1.5 block text-sm font-bold text-stone-700">Tank name</label>
				<input id="name" name="name" class="field" placeholder="e.g. Living room terrarium" required maxlength="100" />
			</div>
			<div>
				<label for="notes" class="mb-1.5 block text-sm font-bold text-stone-700">Notes <span class="font-normal text-stone-400">· optional</span></label>
				<textarea id="notes" name="notes" class="field min-h-20 resize-y" placeholder="Location or general care notes"></textarea>
			</div>
			{#if form?.error}<p class="text-sm text-red-700" role="alert">{form.error}</p>{/if}
			<button class="primary-button w-full"><Plus size={17} /> Add tank</button>
		</form>
	</section>

	<section class="grid gap-3">
		<div class="flex items-center justify-between">
			<h2 class="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Your tanks</h2>
			<a href={resolve('/animals/add-animal')} class="text-sm font-bold text-emerald-700 hover:underline">Add animal group</a>
		</div>
		{#if data.habitats.length}
			{#each data.habitats as habitat (habitat.id)}
				<article class="surface p-4">
					<div class="mb-3 flex items-start justify-between gap-3">
						<div class="flex items-start gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><PanelsTopLeft size={20} /></div>
							<div>
								<h3 class="font-semibold text-stone-900">{habitat.name}</h3>
								<p class="text-sm text-stone-500">{habitat.groupCount} animal {habitat.groupCount === 1 ? 'group' : 'groups'}</p>
								{#if habitat.notes}<p class="mt-1 text-sm text-stone-500">{habitat.notes}</p>{/if}
							</div>
						</div>
						<form method="POST" action="?/remove" use:enhance onsubmit={(event) => {
							if (!confirm(`Remove ${habitat.name}? Animal groups will stay in your account, unassigned.`)) event.preventDefault();
						}}>
							<input type="hidden" name="id" value={habitat.id} />
							<button type="submit" class="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${habitat.name}`}><Trash2 size={16} /></button>
						</form>
					</div>
					<form method="POST" action="?/rename" use:enhance class="flex gap-2">
						<input type="hidden" name="id" value={habitat.id} />
						<input name="name" aria-label="Tank name" value={habitat.name} class="field min-h-10 py-2" required maxlength="100" />
						<button class="secondary-button min-h-10 px-3" aria-label={`Rename ${habitat.name}`}><Pencil size={16} /></button>
					</form>
				</article>
			{/each}
		{:else}
			<div class="surface flex flex-col items-center px-6 py-10 text-center">
				<PanelsTopLeft size={28} class="mb-3 text-emerald-700" />
				<p class="font-semibold text-stone-800">No tanks yet</p>
				<p class="mt-1 text-sm text-stone-500">Create a tank here, then assign animal groups to it.</p>
			</div>
		{/if}
	</section>
</div>
