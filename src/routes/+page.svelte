<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import {
		Activity,
		ArrowRight,
		CalendarDays,
		CheckCircle2,
		ClipboardList,
		PanelsTopLeft,
		PawPrint,
		Plus,
		Utensils,
		UtensilsCrossed
	} from 'lucide-svelte';
	import { formatDateOnly, formatDateTime, getDayOfWeek, localDateKey } from '$lib/dates.js';

	let { data } = $props();
	let todayLabel = $state('');
	let greeting = $state('Good day');
	let todayKey = $state('');
	let todayName = $state('');

	let animalCount = $derived(data.animals.reduce((count, animal) => count + animal.quantity, 0));
	let tankCount = $derived(new Set(data.animals.map((animal) => animal.habitatId).filter(Boolean)).size);
	let scheduledAnimals = $derived(data.animals.filter((animal) => animal.dates.includes(todayName)));
	let groupsToFeedToday = $derived(
		scheduledAnimals.filter(
			(animal) => !animal.lastFed || !todayKey || localDateKey(animal.lastFed) !== todayKey
		).length
	);
	let upcomingTasks = $derived(
		[...data.tasks]
			.sort((a, b) => {
				const aDate = a.dueDate?.slice(0, 10) || '9999-12-31';
				const bDate = b.dueDate?.slice(0, 10) || '9999-12-31';
				return aDate.localeCompare(bDate) || a.title.localeCompare(b.title);
			})
			.slice(0, 4)
	);
	let dueTaskCount = $derived(
		data.tasks.filter((task) => task.dueDate && task.dueDate.slice(0, 10) <= todayKey).length
	);

	function taskStatus(task) {
		if (!task.dueDate) return 'No due date';
		const dueDate = task.dueDate.slice(0, 10);
		if (dueDate < todayKey) return `Overdue · ${formatDateOnly(task.dueDate)}`;
		if (dueDate === todayKey) return 'Due today';
		return `Due · ${formatDateOnly(task.dueDate)}`;
	}

	onMount(() => {
		const now = new Date();
		const hour = now.getHours();
		greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
		todayLabel = now.toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		});
		todayKey = localDateKey(now);
		todayName = getDayOfWeek(now);
	});
</script>

<svelte:head>
	<title>Home · CritterCare</title>
	<meta name="description" content="Today's animal care overview and recent activity." />
</svelte:head>

<div class="flex flex-col gap-6 sm:gap-8">
	<header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-semibold text-emerald-700">{todayLabel}</p>
			<h1 class="mt-1 font-lora text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
				{greeting}, {$page.data.user.name?.split(' ')[0] || 'friend'}.
			</h1>
			<p class="mt-2 text-sm text-stone-500">
				Your care overview{#if tankCount} · {tankCount} {tankCount === 1 ? 'tank' : 'tanks'}{/if}
			</p>
		</div>
		<div class="grid grid-cols-2 gap-2 sm:flex">
			<a href={resolve('/animals/add-food')} class="primary-button">
				<UtensilsCrossed size={17} /> Log feeding
			</a>
			<a href={resolve('/animals/add-animal')} class="secondary-button">
				<Plus size={17} /> Add group
			</a>
		</div>
	</header>

	<section class="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Animal care summary">
		<a href={resolve('/animals')} class="surface flex min-h-28 flex-col justify-between p-4 transition hover:-translate-y-0.5">
			<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><PawPrint size={19} /></span>
			<span>
				<strong class="block text-2xl font-bold text-stone-900">{data.animals.length}</strong>
				<span class="text-xs font-semibold text-stone-500">Animal groups</span>
			</span>
		</a>
		<a href={resolve('/animals')} class="surface flex min-h-28 flex-col justify-between p-4 transition hover:-translate-y-0.5">
			<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><PanelsTopLeft size={19} /></span>
			<span>
				<strong class="block text-2xl font-bold text-stone-900">{animalCount}</strong>
				<span class="text-xs font-semibold text-stone-500">Individual animals</span>
			</span>
		</a>
		<a href={resolve('/animals')} class="surface flex min-h-28 flex-col justify-between p-4 transition hover:-translate-y-0.5">
			<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Utensils size={19} /></span>
			<span>
				<strong class="block text-2xl font-bold text-stone-900">{groupsToFeedToday}</strong>
				<span class="text-xs font-semibold text-stone-500">Groups due today</span>
			</span>
		</a>
		<a href={resolve('/animals/tasks')} class="surface flex min-h-28 flex-col justify-between p-4 transition hover:-translate-y-0.5">
			<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><ClipboardList size={19} /></span>
			<span>
				<strong class="block text-2xl font-bold text-stone-900">{data.tasks.length}</strong>
				<span class="text-xs font-semibold text-stone-500">
					Open tasks{#if dueTaskCount} · {dueTaskCount} due{/if}
				</span>
			</span>
		</a>
	</section>

	<section class="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
		<div class="surface overflow-hidden">
			<div class="flex items-center justify-between border-b border-stone-100 px-4 py-4 sm:px-5">
				<div>
					<p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Today</p>
					<h2 class="mt-1 font-lora text-xl font-semibold text-stone-900">Feeding schedule</h2>
				</div>
				<a href={resolve('/animals')} class="flex items-center gap-1 text-sm font-bold text-emerald-800 hover:text-emerald-950">
					All animals <ArrowRight size={16} />
				</a>
			</div>
			{#if scheduledAnimals.length}
				<div class="divide-y divide-stone-100">
					{#each scheduledAnimals as animal (animal.id)}
						<div class="flex items-center gap-3 px-4 py-3.5 sm:px-5">
							<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><PawPrint size={19} /></span>
							<div class="min-w-0 flex-1">
								<h3 class="truncate font-bold text-stone-900">{animal.name}</h3>
								<p class="truncate text-sm text-stone-500">
									{#if animal.habitatName}{animal.habitatName} · {/if}
									{animal.quantity > 1 ? `${animal.quantity} animals` : '1 animal'}
									· {animal.lastFed && todayKey && localDateKey(animal.lastFed) === todayKey
										? `Fed ${formatDateTime(animal.lastFed)}`
										: 'Due today'}
								</p>
							</div>
							<a
								href={resolve(`/animals/add-food?animal=${encodeURIComponent(animal.name)}`)}
								class="secondary-button min-h-10 shrink-0 px-3 text-xs"
							>
								<Plus size={15} /> {animal.lastFed && todayKey && localDateKey(animal.lastFed) === todayKey
									? 'Feed again'
									: 'Feed'}
							</a>
						</div>
					{/each}
				</div>
			{:else}
				<div class="px-5 py-8 text-center">
					<CalendarDays size={23} class="mx-auto text-stone-300" />
					<p class="mt-2 font-semibold text-stone-700">No groups scheduled today</p>
					<p class="mt-1 text-sm text-stone-500">Add feeding days to your animal groups to see today's plan here.</p>
				</div>
			{/if}
		</div>

		<div class="surface overflow-hidden">
			<div class="flex items-center justify-between border-b border-stone-100 px-4 py-4 sm:px-5">
				<div>
					<p class="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Keep on track</p>
					<h2 class="mt-1 font-lora text-xl font-semibold text-stone-900">Open tasks</h2>
				</div>
				<a href={resolve('/animals/tasks')} class="flex items-center gap-1 text-sm font-bold text-emerald-800 hover:text-emerald-950">
					View all <ArrowRight size={16} />
				</a>
			</div>
			{#if upcomingTasks.length}
				<div class="divide-y divide-stone-100">
					{#each upcomingTasks as task (task.id)}
						<div class="flex items-start gap-3 px-4 py-3.5 sm:px-5">
							<span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700"><CheckCircle2 size={17} /></span>
							<div class="min-w-0 flex-1">
								<h3 class="font-semibold text-stone-900">{task.title}</h3>
								<p class="mt-0.5 text-xs {task.dueDate && task.dueDate.slice(0, 10) < todayKey ? 'font-bold text-red-600' : 'text-stone-500'}">
									{taskStatus(task)}
									{#if task.animalName} · {task.habitatName ? `${task.habitatName} · ` : ''}{task.animalName}{/if}
								</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="px-5 py-8 text-center">
					<Activity size={23} class="mx-auto text-stone-300" />
					<p class="mt-2 font-semibold text-stone-700">You're all caught up</p>
					<a href={resolve('/animals/tasks')} class="mt-2 inline-flex items-center gap-1 text-sm font-bold text-emerald-800">
						Add a care task <ArrowRight size={15} />
					</a>
				</div>
			{/if}
		</div>
	</section>

	<section class="surface overflow-hidden">
		<div class="flex items-center justify-between border-b border-stone-100 px-4 py-4 sm:px-5">
			<div>
				<p class="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Recent activity</p>
				<h2 class="mt-1 font-lora text-xl font-semibold text-stone-900">Latest feedings</h2>
			</div>
			<a href={resolve('/animals')} class="flex items-center gap-1 text-sm font-bold text-emerald-800 hover:text-emerald-950">
				Feeding history <ArrowRight size={16} />
			</a>
		</div>
		{#if data.feedings.length}
			<div class="grid divide-y divide-stone-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
				{#each data.feedings as feeding (feeding.id)}
					<div class="flex min-w-0 items-start gap-3 px-4 py-3.5 sm:px-5">
						<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Utensils size={17} /></span>
						<div class="min-w-0">
							<p class="truncate font-bold text-stone-900">{feeding.food}</p>
							<p class="truncate text-sm text-stone-600">{feeding.animalName}</p>
							<p class="mt-0.5 truncate text-xs text-stone-400">
								{#if feeding.habitatName}{feeding.habitatName} · {/if}{formatDateTime(feeding.fed)}{#if feeding.fedBy} · {feeding.fedBy}{/if}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="px-5 py-8 text-center">
				<p class="font-semibold text-stone-700">No feedings logged yet</p>
				<a href={resolve('/animals/add-food')} class="mt-2 inline-flex items-center gap-1 text-sm font-bold text-emerald-800">
					Log the first feeding <ArrowRight size={15} />
				</a>
			</div>
		{/if}
	</section>

	{#if data.animals.length === 0}
		<section class="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-5 text-center sm:p-8">
			<PawPrint size={28} class="mx-auto text-emerald-700" />
			<h2 class="mt-3 font-lora text-xl font-semibold text-stone-900">Start your animal log</h2>
			<p class="mx-auto mt-1 max-w-md text-sm text-stone-600">Add a group to set up feeding days, log meals, and keep care tasks together.</p>
			<a href={resolve('/animals/add-animal')} class="primary-button mt-4"><Plus size={17} /> Add an animal group</a>
		</section>
	{/if}
</div>