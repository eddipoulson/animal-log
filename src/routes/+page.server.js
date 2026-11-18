import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!locals.pb.authStore.isValid) {
		throw redirect(303, '/login');
	}

	const owner = locals.pb.authStore.model.id;
	const [animals, feedings, tasks] = await Promise.all([
		locals.pb.collection('animals').getFullList({
			filter: `owner="${owner}"`,
			sort: 'name',
			expand: 'habitat',
			fields: 'id,name,description,quantity,dates,lastFed,habitat,expand.habitat.name'
		}),
		locals.pb.collection('feedings').getList(1, 6, {
			sort: '-fed',
			expand: 'animal,animal.habitat'
		}),
		locals.pb.collection('tasks').getFullList({
			filter: `owner="${owner}" && completed=false`,
			sort: 'dueDate,title',
			expand: 'animal,animal.habitat'
		})
	]);

	return {
		animals: animals.map((animal) => ({
			id: animal.id,
			name: animal.name,
			description: animal.description,
			quantity: animal.quantity || 1,
			dates: animal.dates ?? [],
			lastFed: animal.lastFed,
			habitatId: animal.habitat,
			habitatName: animal.expand?.habitat?.name ?? ''
		})),
		feedings: feedings.items.map((feeding) => ({
			id: feeding.id,
			food: feeding.food,
			fed: feeding.fed,
			fedBy: feeding.fedBy,
			animalName: feeding.expand?.animal?.name ?? 'Animal group',
			habitatName: feeding.expand?.animal?.expand?.habitat?.name ?? ''
		})),
		tasks: tasks.map((task) => ({
			id: task.id,
			title: task.title,
			dueDate: task.dueDate,
			animalName: task.expand?.animal?.name ?? '',
			habitatName: task.expand?.animal?.expand?.habitat?.name ?? ''
		}))
	};
}
