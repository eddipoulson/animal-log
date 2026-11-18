<script>
	import { onMount } from 'svelte';
	import { Check, PawPrint, Utensils } from 'lucide-svelte';
	import { formatDateOnly, formatDateTime } from '$lib/dates.js';

	let { data, form } = $props();
	let visitorName = $state('');

	onMount(() => {
		visitorName = localStorage.getItem(`animal-log-helper:${data.token}`) ?? '';
	});

	function rememberVisitor() {
		if (visitorName.trim()) {
			localStorage.setItem(`animal-log-helper:${data.token}`, visitorName.trim());
		}
	}

</script>

<svelte:head>
	<title>Animal care visit</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="mx-auto flex max-w-xl flex-col gap-5">
	<header class="text-center">
		<div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
			<PawPrint size={24} />
		</div>
		<p class="text-sm font-bold text-emerald-700">CritterCare · Care visit</p>
		<h1 class="mt-1 font-lora text-3xl font-semibold">Thanks for checking in</h1>
		<p class="mt-1 text-sm text-stone-500">See the care notes and log what you do below.</p>
	</header>

	{#if !data.available}
		<section class="surface px-6 py-12 text-center">
			<h2 class="font-lora text-xl font-semibold">This link is no longer available</h2>
			<p class="mt-2 text-sm text-stone-500">{data.message || 'Ask the animal owner for a new care link.'}</p>
		</section>
	{:else}
		{#if data.share.permission !== 'view_only'}
			<section class="surface p-4 sm:p-5">
				<label for="visitorName" class="mb-1.5 block text-sm font-bold text-stone-700">Your name</label>
				<input
					id="visitorName"
					bind:value={visitorName}
					oninput={rememberVisitor}
					class="field"
					placeholder="Who is helping today?"
					maxlength="100"
					autocomplete="name"
					required
				/>
				<p class="mt-1.5 text-xs text-stone-400">We'll remember it on this device and include it with your care logs.</p>
			</section>
		{/if}

		{#if data.saved}
			<div class="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" role="status">
				<Check size={18} /> Care log saved — thank you!
			</div>
		{/if}
		{#if form?.error}
			<div class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{form.error}</div>
		{/if}

		{#each data.share.groups as group (group.id)}
			<section class="surface overflow-hidden">
				<div class="border-b border-stone-100 p-4 sm:p-5">
					{#if group.habitatName}<p class="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-700">{group.habitatName}</p>{/if}
					<h2 class="font-lora text-2xl font-semibold">{group.name}</h2>
					<p class="mt-1 text-sm text-stone-500">{group.quantity > 1 ? `${group.quantity} · ` : ''}{group.description}</p>
					{#if group.dates?.length}
						<p class="mt-3 text-xs font-semibold text-stone-500">Feed days · {group.dates.join(', ')}</p>
					{/if}
				</div>

				{#if group.canLogFeedings}
					<form method="POST" action="?/log" onsubmit={rememberVisitor} class="grid gap-2 border-b border-stone-100 p-4 sm:grid-cols-[1fr_auto]">
						<input type="hidden" name="action" value="feed" />
						<input type="hidden" name="animalId" value={group.id} />
						<input type="hidden" name="visitorName" value={visitorName} />
						<label class="sr-only" for="food-{group.id}">What did you feed?</label>
						<input id="food-{group.id}" name="food" class="field min-h-11" placeholder="What did you feed?" maxlength="200" required disabled={!visitorName.trim()} />
						<button class="primary-button" disabled={!visitorName.trim()}><Utensils size={16} /> Log feeding</button>
					</form>
				{/if}

				<div class="p-4 sm:p-5">
					<h3 class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Care tasks</h3>
					{#if group.tasks.length}
						<div class="grid gap-2">
							{#each group.tasks as task (task.id)}
								<div class="flex items-start justify-between gap-3 rounded-xl bg-stone-50 p-3">
									<div>
										<p class="font-semibold {task.completed ? 'text-stone-500 line-through' : 'text-stone-800'}">{task.title}</p>
										{#if task.notes}<p class="mt-1 text-sm text-stone-500">{task.notes}</p>{/if}
										{#if task.completed}
											<p class="mt-1 text-xs text-emerald-700">Done{task.completedBy ? ` by ${task.completedBy}` : ''}{task.completedAt ? ` · ${formatDateTime(task.completedAt)}` : ''}</p>
										{:else if task.dueDate}
											<p class="mt-1 text-xs text-stone-500">Due {formatDateOnly(task.dueDate)}</p>
										{/if}
									</div>
									{#if !task.completed && group.canCompleteTasks}
										<form method="POST" action="?/log" onsubmit={rememberVisitor}>
											<input type="hidden" name="action" value="completeTask" />
											<input type="hidden" name="animalId" value={group.id} />
											<input type="hidden" name="taskId" value={task.id} />
											<input type="hidden" name="visitorName" value={visitorName} />
											<button class="secondary-button min-h-9 px-3 text-xs" disabled={!visitorName.trim()}>Mark done</button>
										</form>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-stone-400">No care tasks listed.</p>
					{/if}
				</div>

				{#if group.feedings.length}
					<div class="border-t border-stone-100 px-4 py-3 sm:px-5">
						<h3 class="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Recent feedings</h3>
						{#each group.feedings as feeding, index (`${feeding.fed}-${index}`)}
							<p class="py-1 text-sm text-stone-600">{feeding.food} · {formatDateTime(feeding.fed)}{#if feeding.fedBy} · {feeding.fedBy}{/if}</p>
						{/each}
					</div>
				{/if}
			</section>
		{:else}
			<section class="surface px-6 py-12 text-center">
				<h2 class="font-lora text-xl font-semibold">No animal groups in this link</h2>
				<p class="mt-2 text-sm text-stone-500">Ask the owner to share the groups you’re caring for.</p>
			</section>
		{/each}
	{/if}
</div>
