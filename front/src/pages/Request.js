import react from 'react';
import Item from '../components/Card/Item';
import '../styles/navBar.css';

function Request({
	button: { icon, onClick } = {},
	imgSrc = 'https://i.redd.it/d3n9acugx3g41.jpg',
	reqId,
	onSelect,
	acceptOrder,
	declineOrder,
	name,
	orderSelected,
	...restProps
}) {
	console.log(restProps);
	return (
		<div className="requestWrapper">
			<Item
				imgSrc={imgSrc}
				id={reqId}
				name={name}
				{...restProps}
				onSelect={orderSelected}
			/>
			<div className="btnsWrapper">
				<div class="ui large buttons">
					<button
						class="ui green button"
						onClick={() => {
							acceptOrder(reqId);
						}}
					>
						Accept
					</button>
					<div class="or"></div>
					<button
						class="ui red button"
						onClick={() => {
							declineOrder(reqId);
						}}
					>
						Decline
					</button>
				</div>
			</div>
		</div>
	);
}

export default Request;
