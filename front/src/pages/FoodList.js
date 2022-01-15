import react from 'react';
import { useState, useEffect } from 'react';
import { ListOfItems } from '../components/List';
import { getFoodFromOrder } from '../API/Orders';
import { useSocket } from '../context/socketProvider';
function FoodList({ id }) {
	const socket = useSocket();
	const [items, setItems] = useState([]);
	const updateItems = async () => {
		getFoodFromOrder(id)
			.then(({ data }) => {
				data = data.map((el) => {
					el.food.id = el.rel.id;
					el.food.date = el.rel.date;
					return { ...el.food };
				});
				setItems(data);
			})
			.catch((err) => alert(err));
	};

	useEffect(() => {
		updateItems();
	}, []);

	return (
		<div>
			<ListOfItems>{items}</ListOfItems>
		</div>
	);
}

export default FoodList;
