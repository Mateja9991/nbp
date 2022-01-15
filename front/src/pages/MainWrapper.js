import react from 'react';
import NavBar from '../components/NavBar';
import { useEffect, useState } from 'react';
import Homepage from './Home';
import Chat from './Chat/Chat';
import Settings from './Settings';
import Basket from './Basket';
import DeliveriesPage from './Deliveries';
import DeliveryPage from './Delivery';
import RestaurantMenuPage from './RestaurantMenu';
import RestaurantsPage from './Restaurants';
import OrdersPage from './Orders';
import InstancesPage from './Instances';
import CurrentDeliveriesPage from './CurrentDeliveries';
import CurrentOrdersPage from './CurrentOrders';
import Requests from './Requests';
import FoodList from './FoodList';
import RestaurantReviews from './Reviews/RestaurantReviews';
import { SocketProvider, useSocket } from '../context/socketProvider';
import { useHistory, Switch, Route } from 'react-router-dom';
import { deleteRestaurantsFood, addFoodToRestaurant } from '../API/Restaurants';
import '../styles/navBar.css';

function MainWrapper({ user: { role, ...user } }) {
	const [newReq, setNewReq] = useState();
	const [restaurant, setRestaurant] = useState(
		role == 'Restaurant' ? user.id : null
	);
	const [delivery, setDelivery] = useState(null);
	const [order, setOrder] = useState(null);
	const [instance, setInstance] = useState(null);
	const [orderId, setOrderId] = useState(null);
	let history = useHistory();

	const HomeWrapper = () => (
		<Homepage
			role={role}
			user={user}
			restaurant={restaurant}
			setInstance={setInstance}
			setRestaurant={setRestaurant}
		/>
	);

	const orderSelected = (orderId) => {
		setOrderId(orderId);
		history.push('/Home/FoodList');
	};

	const FoodListWrapper = () => <FoodList id={orderId} />;

	const ChatWrapper = () => <Chat user={user} role={role} />;
	const SettingsWrapper = () => <Settings role={role} />;
	const BasketWrapper = () => <Basket restId={restaurant} />;
	const DeliveriesWrapper = () => (
		<DeliveriesPage role={role} user={user} itemSelected={checkDelivery} />
	);
	const checkDelivery = (deliveryId) => {
		history.push('/Home/Delivery');
		//??? zasto setRestaurant
		setRestaurant(deliveryId);
	};
	const CurrentDeliveriesWrapper = () => (
		<CurrentDeliveriesPage user={user} orderSelected={orderSelected} />
	);
	const CurrentOrdersWrapper = () => (
		<CurrentOrdersPage user={user} itemSelected={orderSelected} />
	);
	const DeliveryWrapper = () => <DeliveryPage delivery={delivery} />;
	const OrdersWrapper = () => (
		<OrdersPage role={role} user={user} orderSelected={orderSelected} />
	);
	const InstancesWrapper = () => <InstancesPage user={user} />;
	const RequestsWrapper = () => (
		<Requests setNewReq={setNewReq} role={role} orderSelected={orderSelected} />
	);
	const checkRestaurant = (restId) => {
		history.push('/Home/Menu');
		setRestaurant(restId);
	};
	const RestaurantsPageWrapper = () => (
		<RestaurantsPage
			user={user}
			setRestaurant={checkRestaurant}
			setOrder={setOrder}
			setForReview={setForReview}
		/>
	);

	const RestaurantMenuWrapper = () => (
		<RestaurantMenuPage
			role={role}
			user={user}
			restId={restaurant}
			setOrder={setOrder}
		/>
	);

	const setForReview = (restId) => {
		history.push('/Home/Reviews');
		setRestaurant(restId);
	};

	const RestaurantReviewsWrapper = () => (
		<RestaurantReviews restId={restaurant} role={role} />
	);

	return (
		<SocketProvider>
			<div className="outter">
				<div className="navBar">
					<NavBar role={role} newReqNum={newReq} />
				</div>
				<div className="pageWrapper">
					<Switch>
						<Route
							path="/Home/Restaurants"
							exact
							component={RestaurantsPageWrapper}
						/>
						<Route path="/Home/Menu" exact component={RestaurantMenuWrapper} />
						<Route
							path="/Home/CurrentDeliveries"
							exact
							component={CurrentDeliveriesWrapper}
						/>
						<Route path="/Home/Orders" exact component={OrdersWrapper} />
						<Route path="/Home/Chat" exact component={ChatWrapper} />
						<Route path="/Home/Instances" exact component={InstancesWrapper} />
						<Route path="/Home/Settings" exact component={SettingsWrapper} />
						<Route path="/Home/Basket" exact component={BasketWrapper} />
						<Route
							path="/Home/Deliveries"
							exact
							component={DeliveriesWrapper}
						/>
						<Route path="/Home/Delivery" exact component={DeliveryWrapper} />
						<Route path="/Home/Requests" exact component={RequestsWrapper} />
						<Route
							path="/Home/CurrentOrders"
							exact
							component={CurrentOrdersWrapper}
						/>
						<Route path="/Home/FoodList" exact component={FoodListWrapper} />
						<Route
							path="/Home/Reviews"
							exact
							component={RestaurantReviewsWrapper}
						/>
					</Switch>
				</div>
			</div>
		</SocketProvider>
	);
}

export default MainWrapper;
