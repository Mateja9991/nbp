import react from 'react';
import { Link } from 'react-router-dom';
import '../styles/navBar.css';
import { updateCurrentUser, deleteCurrentUser, updateRestaurant } from '../API';
import useStorage from '../common/storage';
import FormData from 'form-data';
import { delFoodFromPendingOrder } from '../API/Restaurants';

function Settings({ role }) {
	const { storage, setStorage } = useStorage();
	const updateUser =
		role == 'Restaurant' ? updateRestaurant : updateCurrentUser;
	const onSubmitUpdate = async (event) => {
		event.preventDefault();
		const {
			target: { name, email, password, file },
		} = event;
		console.log(name, email, file, password);
		if (name.value || email.value || password.value || (file && file.value)) {
			var user = {};
			const formData = new FormData();

			if (name.value != '') {
				user.name = name.value;
				formData.append('name', name.value);
			}
			if (email.value != '') {
				user.email = email.value;
				formData.append('email', email.value);
			}
			if (password.value != '') {
				formData.append('password', password.value);
				user.password = password.value;
			}
			if (file && file.value) {
				console.log('PROFIL IMG ADD');
				formData.append('profileImg', file.files[0]);
				console.log('profileImg', file.files[0]);
			}
			const response = await updateUser(role == 'Restaurant' ? formData : user);
			if (response && response.status == 200) {
				const {
					data: { user, token },
				} = response;
				setStorage({
					...user,
				});
			}
		} else alert('Morate uneti bar jedan podatak za azuriranje.');
	};

	const onDeleteUser = async () => {
		const response = await deleteCurrentUser();
		localStorage.clear();
	};

	return (
		<div className="formWrapper">
			<form id="test" class="ui form" method="PATCH" onSubmit={onSubmitUpdate}>
				<h4 class="ui center aligned top attached header">
					Make changes to your profile.
				</h4>
				<div id="form-segment" class="ui center aligned attached segment">
					<div class="field">
						<label for="email">Name:</label>
						<input
							type="text"
							id="name"
							name="name"
							placeholder="Enter new name..."
						/>
					</div>
					<div class="field">
						<label for="email">E-mail:</label>
						<input
							type="email"
							id="email"
							name="email"
							placeholder="Enter new email..."
						/>
					</div>
					<div class="field">
						<label for="password">Password:</label>
						<input
							type="password"
							id="password"
							name="password"
							placeholder="••••••••"
						/>
					</div>
					{role == 'Restaurant' ? (
						<div class="field">
							<input
								name="file"
								type="file"
								onChange={(e) => {
									console.log(e.target.files);
								}}
							/>
						</div>
					) : (
						''
					)}
				</div>
				<button class="ui bottom attached fluid button" type="submit">
					Update
				</button>
				<Link to="/">
					<button
						class="red ui bottom attached fluid button"
						onClick={onDeleteUser}
					>
						Delete Profile
					</button>
				</Link>
			</form>
		</div>
	);
}

export default Settings;
