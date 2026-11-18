<script>
	import { page } from '$app/stores';
	import {
		Activity,
		ChevronDown,
		Ellipsis,
		Home,
		PanelsTopLeft,
		PawPrint,
		QrCode,
		Share2,
		UtensilsCrossed
	} from 'lucide-svelte';
	import { resolve } from '$app/paths';

	const primaryLinks = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/animals', label: 'Animals', icon: PawPrint },
		{ href: '/animals/tasks', label: 'Tasks', icon: Activity },
		{ href: '/animals/add-food', label: 'Feed', icon: UtensilsCrossed }
	];
	const moreLinks = [
		{ href: '/animals/tanks', label: 'Tanks', icon: PanelsTopLeft },
		{ href: '/animals/share', label: 'Share care', icon: Share2 },
		{ href: '/animals/add-food/scan', label: 'Scan to feed', icon: QrCode }
	];

	function isActive(link) {
		const path = $page.url.pathname;
		if (link.href === '/') return path === '/';
		if (link.href === '/animals') {
			return (
				path === '/animals' ||
				path === '/animals/add-animal' ||
				/^\/animals\/[a-z0-9]{15}(?:\/edit)?$/.test(path)
			);
		}
		return path === link.href;
	}

	function moreIsActive() {
		const path = $page.url.pathname;
		return moreLinks.some(
			(link) => path === link.href || path.startsWith(`${link.href}/`)
		);
	}

	function closeMore(event) {
		const menu = event.currentTarget.closest('details');
		if (menu) menu.open = false;
	}
</script>

{#if $page.data?.user}
	<header class="sticky top-0 z-40 hidden border-b border-stone-200/80 bg-white/90 backdrop-blur sm:block">
		<nav class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6" aria-label="Main navigation">
			<a href={resolve('/')} class="flex shrink-0 items-center gap-2 font-lora text-lg font-bold text-stone-900">
				<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
					<PawPrint size={20} />
				</span>
				CritterCare
			</a>
			<div class="flex h-full items-center gap-1">
				{#each primaryLinks as link (link.href)}
					<a
						href={resolve(link.href)}
						aria-current={isActive(link) ? 'page' : undefined}
						class="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors {isActive(link)
							? 'bg-emerald-50 text-emerald-800'
							: 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}"
					>
						<svelte:component this={link.icon} size={17} strokeWidth={isActive(link) ? 2.5 : 2} />
						{link.label}
					</a>
				{/each}
				<details class="group relative">
					<summary
						aria-current={moreIsActive() ? 'page' : undefined}
						class="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors {moreIsActive()
							? 'bg-emerald-50 text-emerald-800'
							: 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}"
					>
						<Ellipsis size={18} />
						More
						<ChevronDown size={14} class="transition-transform group-open:rotate-180" />
					</summary>
					<div class="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
						{#each moreLinks as link (link.href)}
							<a
								href={resolve(link.href)}
								onclick={closeMore}
								aria-current={isActive(link) ? 'page' : undefined}
								class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold {isActive(link)
									? 'bg-emerald-50 text-emerald-800'
									: 'text-stone-600 hover:bg-stone-50'}"
							>
								<svelte:component this={link.icon} size={17} />
								{link.label}
							</a>
						{/each}
					</div>
				</details>
			</div>
		</nav>
	</header>

	<nav
		class="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/90 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur sm:hidden"
		aria-label="Main navigation"
	>
		<div class="mx-auto grid max-w-xl grid-cols-5">
			{#each primaryLinks as link (link.href)}
				<a
					href={resolve(link.href)}
					aria-current={isActive(link) ? 'page' : undefined}
					class="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-colors active:scale-95 {isActive(link)
						? 'bg-emerald-50 text-emerald-800'
						: 'text-stone-400 hover:bg-stone-50 hover:text-stone-700'}"
				>
					<svelte:component this={link.icon} size={20} strokeWidth={isActive(link) ? 2.5 : 1.75} />
					<span class="text-[10px] font-semibold">{link.label}</span>
				</a>
			{/each}
			<details class="group relative">
				<summary
					aria-label="More navigation"
					aria-current={moreIsActive() ? 'page' : undefined}
					class="flex min-w-0 cursor-pointer list-none flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-stone-400 transition-colors active:scale-95 {moreIsActive()
						? 'bg-emerald-50 text-emerald-800'
						: 'hover:bg-stone-50 hover:text-stone-700'}"
				>
					<Ellipsis size={20} strokeWidth={moreIsActive() ? 2.5 : 1.75} />
					<span class="text-[10px] font-semibold">More</span>
				</summary>
				<div class="absolute bottom-16 right-0 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
					{#each moreLinks as link (link.href)}
						<a
							href={resolve(link.href)}
							onclick={closeMore}
							aria-current={isActive(link) ? 'page' : undefined}
							class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold {isActive(link)
								? 'bg-emerald-50 text-emerald-800'
								: 'text-stone-600 hover:bg-stone-50'}"
						>
							<svelte:component this={link.icon} size={17} />
							{link.label}
						</a>
					{/each}
				</div>
			</details>
		</div>
	</nav>
{/if}
