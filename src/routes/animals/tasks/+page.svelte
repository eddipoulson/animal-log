<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { Check, Circle, ClipboardList, Plus, Trash2 } from 'lucide-svelte';
	import { formatDateOnly, localDateKey } from '$lib/dates.js';

	let { data, form } = $props();
	let filter = $state('open');
	let todayKey = $state('');

	let openTasks = $derived(data.tasks.filter((task) => !task.completed));
	let completedTasks = $derived(data.tasks.filter((task) => task.completed));
	let visibleTasks = $derived(
		filter === 'open' ? openTasks : filter === 'completed' ? completedTasks : data.tasks
	);

	function isOverdue(value) {
		return value && value.slice(0, 10) < todayKey;
	}

	onMount(() => {
		todayKey = localDateKey();
	});
</script>

<svelte:head>
	<title>Tasks · CritterCare</title>
	<meta name="description" content="Keep track of care tasks for your animals." />
</svelte:head>

<div class="flex flex-col gap-5">
	<header class="flex items-end justify-between gap-4">
		<div>
			<p class="text-sm font-bold text-emerald-700">Care routine</p>
			<h1 class="mt-1 font-lora text-3xl font-semibold tracking-tight sm:text-4xl">Tasks</h1>
			<p class="mt-1 text-sm text-stone-500">The little things that keep them thriving.</p>
		</div>
		<div class="hidden rounded-2xl bg-emerald-50 px-4 py-3 text-right sm:block">
			<p class="text-2xl font-bold text-emerald-800">{openTasks.length}</p>
			<p class="text-xs font-semibold text-emerald-700">to do</p>
		</div>
	</header>

	<section class="surface p-4 sm:p-5">
		<h2 class="mb-4 font-lora text-xl font-semibold">Add a task</h2>
		<form method="POST" action="?/add" use:enhance class="grid gap-3 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="title" class="mb-1.5 block text-sm font-bold text-stone-700">What needs doing?</label>
				<input id="title" name="title" class="field" placeholder="e.g. Clean the terrarium" required maxlength="200" />
			</div>
			<div>
				<label for="animal" class="mb-1.5 block text-sm font-bold text-stone-700">Animal <span class="font-normal text-stone-400">· optional</span></label>
				<select id="animal" name="animal" class="field">
					<option value="">General task</option>
					{#each data.animals as animal (animal.id)}
						<option value={animal.id}>{animal.habitatName ? `${animal.habitatName} · ` : ''}{animal.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="dueDate" class="mb-1.5 block text-sm font-bold text-stone-700">Due date <span class="font-normal text-stone-400">· optional</span></label>
				<input id="dueDate" name="dueDate" type="date" class="field" />
			</div>
			<div class="sm:col-span-2">
				<label for="notes" class="mb-1.5 block text-sm font-bold text-stone-700">Notes <span class="font-normal text-stone-400">· optional</span></label>
				<textarea id="notes" name="notes" class="field min-h-20 resize-y" placeholder="Add any useful details"></textarea>
			</div>
			{#if form?.error}
				<p class="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{form.error}</p>
			{/if}
			<button type="submit" class="primary-button sm:col-span-2"><Plus size={17} /> Add task</button>
		</form>
	</section>

	<section class="flex flex-col gap-3">
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Your list</h2>
			<div class="flex rounded-xl bg-stone-100 p-1" aria-label="Filter tasks">
				{#each [{ id: 'open', label: 'To do' }, { id: 'all', label: 'All' }, { id: 'completed', label: 'Done' }] as option (option.id)}
					<button
						type="button"
						class="rounded-lg px-3 py-1.5 text-xs font-bold transition-colors {filter === option.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}"
						aria-pressed={filter === option.id}
						onclick={() => (filter = option.id)}
					>{option.label}</button>
				{/each}
			</div>
		</div>

		{#if visibleTasks.length}
			<div class="grid gap-2">
				{#each visibleTasks as task (task.id)}
					<article class="surface flex items-start gap-3 p-4 transition-opacity {task.completed ? 'opacity-70' : ''}">
						<form method="POST" action="?/toggle" use:enhance class="pt-0.5">
							<input type="hidden" name="id" value={task.id} />
							<button
								type="submit"
								class="flex h-7 w-7 items-center justify-center rounded-full transition-colors {task.completed ? 'bg-emerald-700 text-white' : 'border-2 border-stone-300 text-transparent hover:border-emerald-600'}"
								aria-label={task.completed ? `Mark ${task.title} as not done` : `Complete ${task.title}`}
								title={task.completed ? 'Mark as not done' : 'Mark complete'}
							>
								{#if task.completed}<Check size={15} />{:else}<Circle size={12} />{/if}
							</button>
						</form>
						<div class="min-w-0 flex-1">
							<h3 class="font-semibold text-stone-900 {task.completed ? 'text-stone-500 line-through' : ''}">{task.title}</h3>
							{#if task.notes}<p class="mt-1 whitespace-pre-line text-sm text-stone-500">{task.notes}</p>{/if}
							<div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
								{#if task.animalName}<span class="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">{task.habitatName ? `${task.habitatName} · ` : ''}{task.animalName}</span>{/if}
								{#if task.dueDate}
									<span class="{!task.completed && isOverdue(task.dueDate) ? 'text-red-600' : 'text-stone-400'}">
										{!task.completed && isOverdue(task.dueDate) ? 'Overdue · ' : 'Due · '}{formatDateOnly(task.dueDate)}
									</span>
								{/if}
							</div>
						</div>
						<form method="POST" action="?/remove" use:enhance>
							<input type="hidden" name="id" value={task.id} />
							<button type="submit" class="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${task.title}`} title="Delete task">
								<Trash2 size={16} />
							</button>
						</form>
					</article>
				{/each}
			</div>
		{:else}
			<div class="surface flex flex-col items-center px-6 py-12 text-center">
				<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
					<ClipboardList size={23} />
				</div>
				<h3 class="font-lora text-xl font-semibold">
					{filter === 'completed' ? 'Nothing completed yet' : filter === 'all' ? 'No tasks yet' : 'All caught up'}
				</h3>
				<p class="mt-1 max-w-xs text-sm text-stone-500">
					{filter === 'open' ? 'Add a care task above and it will show up here.' : 'Tasks you add will appear here.'}
				</p>
			</div>
		{/if}
	</section>
</div>
