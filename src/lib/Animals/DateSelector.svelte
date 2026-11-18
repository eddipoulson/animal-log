<script>
	let { loading, selectedDays } = $props();

	let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	let checkedDays = $state([]);

	$effect(() => {
		if (selectedDays) checkedDays = [...selectedDays];
	});
</script>

<fieldset class="w-full">
	<legend class="sr-only">Choose feeding days</legend>
	<div class="grid grid-cols-7 gap-1.5">
		{#each days as day (day)}
			<label class="cursor-pointer">
				<input
					type="checkbox"
					name={day}
					value={day}
					class="peer sr-only"
					bind:group={checkedDays}
					disabled={loading}
				/>
				<span
					class="flex h-11 select-none items-center justify-center rounded-xl bg-stone-100 text-xs font-bold text-stone-600 transition-[background-color,color,box-shadow,transform] duration-150 ease-out hover:bg-stone-200 peer-checked:bg-emerald-700 peer-checked:text-white peer-checked:shadow-sm peer-active:scale-95 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600 peer-focus-visible:ring-offset-2 sm:text-sm"
					aria-hidden="true"
				>
					{day.substring(0, 3)}
				</span>
			</label>
		{/each}
	</div>
</fieldset>
