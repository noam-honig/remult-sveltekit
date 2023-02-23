<script lang="ts">
	import { remult } from 'remult';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { Task } from '../shared/Task';

	const taskRepo = remult.repo(Task);

	let tasks = writable<Task[]>([]);
	let newTaskTitle: '';

	onMount(async () => {
		// 1/ Default
		$tasks = await taskRepo.find();

		// 2/ Showing limits
		// tasks = await taskRepo.find({ limit: 1 });

		// 3/ Showing live (not working atm)
		// taskRepo.liveQuery().subscribe((info) => {
		// 	$tasks = info.items;
		// });
	});

	const addTask = async (e: Event) => {
		console.log(`newTaskTitle`, newTaskTitle);
		const newTask = await taskRepo.insert({ title: newTaskTitle });
		console.log(`newTask`, newTask);

		$tasks = [...$tasks, newTask];
	};

	const updateList = async () => {
		await taskRepo.save({ ...$tasks });
	};
</script>

<form on:submit|preventDefault={addTask}>
	<input bind:value={newTaskTitle} placeholder="What needs to be done?" />
	<button>Add</button>
</form>
{#each $tasks as task}
	<div>
		<input type="checkbox" bind:checked={task.completed} on:change={updateList} />
		<input bind:value={task.title} />
		<button on:click={updateList}>Save</button>
	</div>
{/each}
