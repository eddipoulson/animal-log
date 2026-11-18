<script>
	import { enhance } from '$app/forms';
	import { Check, Copy, Link2, ShieldCheck, Trash2 } from 'lucide-svelte';
	import { formatDateTime } from '$lib/dates.js';

	let { data, form } = $props();
	let copied = $state(false);

	async function copyLink() {
		await navigator.clipboard.writeText(form.shareUrl);
		copied = true;
	}
</script>

<svelte:head>
	<title>Share care access · CritterCare</title>
</svelte:head>

<div class="mx-auto flex max-w-xl flex-col gap-5">
	<header>
		<p class="text-sm font-bold text-emerald-700">Vacation care</p>
		<h1 class="mt-1 font-lora text-3xl font-semibold">Share a care link</h1>
		<p class="mt-1 text-sm text-stone-500">A helper can log care for selected groups without creating an account.</p>
	</header>

	<div class="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
		<ShieldCheck size={20} class="mt-0.5 shrink-0 text-emerald-700" />
		<p>Links expire after 7 days and can be revoked at any time. The visitor's name is saved with each feeding or task they log.</p>
	</div>

	<section class="surface p-4 sm:p-5">
		<h2 class="mb-1 font-lora text-xl font-semibold">Create a new link</h2>
		<p class="mb-4 text-sm text-stone-500">Only the groups you select are visible through this link.</p>
		{#if data.animals.length}
			<form method="POST" action="?/create" use:enhance class="grid gap-4">
				<fieldset class="grid gap-2">
					<legend class="mb-1 text-sm font-bold text-stone-700">Animal groups</legend>
					{#each data.animals as animal (animal.id)}
						<label class="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50">
							<input type="checkbox" name="animals" value={animal.id} class="mt-1 h-4 w-4 accent-emerald-700" />
							<span>
								<span class="block font-semibold text-stone-800">{animal.name}</span>
								<span class="block text-sm text-stone-500">{animal.habitatName ? `${animal.habitatName} · ` : ''}{animal.description}</span>
							</span>
						</label>
					{/each}
				</fieldset>
				<div>
					<label for="permission" class="mb-1.5 block text-sm font-bold text-stone-700">Visitor permissions</label>
					<select id="permission" name="permission" class="field">
						<option value="feeding_and_tasks">Log feedings and complete tasks</option>
						<option value="feeding_only">Log feedings only</option>
						<option value="view_only">View only</option>
					</select>
				</div>
				{#if form?.error}<p class="text-sm text-red-700" role="alert">{form.error}</p>{/if}
				<button type="submit" class="primary-button w-full"><Link2 size={17} /> Create 7-day link</button>
			</form>
		{:else}
			<div class="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
				Add at least one animal group before creating a care link.
			</div>
		{/if}

		{#if form?.shareUrl}
			<div class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
				<p class="mb-2 text-sm font-bold text-emerald-900">Link created — copy it now</p>
				<p class="mb-3 text-xs text-emerald-800">For your privacy, the link is shown only once. If you lose it, revoke it and create another.</p>
				<div class="flex gap-2">
					<input aria-label="Share link" class="field min-h-10 py-2 text-sm" readonly value={form.shareUrl} />
					<button type="button" class="secondary-button min-h-10 px-3" onclick={copyLink} aria-label="Copy share link">
						{#if copied}<Check size={17} />{:else}<Copy size={17} />{/if}
					</button>
				</div>
			</div>
		{/if}
	</section>

	<section class="grid gap-3">
		<h2 class="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Your links</h2>
		{#if data.shares.length}
			{#each data.shares as share (share.id)}
				<article class="surface flex items-start justify-between gap-3 p-4">
					<div>
						<p class="font-semibold text-stone-800">{share.groups.join(', ')}</p>
						<p class="mt-1 text-sm text-stone-500">
							{share.permission === 'view_only' ? 'View only' : share.permission === 'feeding_only' ? 'Feedings only' : 'Feedings and tasks'}
							· expires {formatDateTime(share.expiresAt)}
						</p>
						{#if share.revoked}
							<span class="mt-2 inline-block rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-500">Revoked</span>
						{:else if share.expired}
							<span class="mt-2 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Expired</span>
						{:else}
							<span class="mt-2 inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Active</span>
						{/if}
					</div>
					{#if !share.revoked && !share.expired}
						<form method="POST" action="?/revoke" use:enhance onsubmit={(event) => {
							if (!confirm('Revoke this care link now? Anyone using it will lose access.')) event.preventDefault();
						}}>
							<input type="hidden" name="id" value={share.id} />
							<button type="submit" class="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600" aria-label="Revoke care link"><Trash2 size={16} /></button>
						</form>
					{/if}
				</article>
			{/each}
		{:else}
			<div class="surface px-5 py-8 text-center text-sm text-stone-500">You haven't created a care link yet.</div>
		{/if}
	</section>
</div>
