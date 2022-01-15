import { useEffect, useState } from 'react';
import { useHistory, Switch, Route } from 'react-router-dom';
import { Login, Register } from './pages';
import MainWrapper from './pages/MainWrapper';
//import './components/styles/App.css';
import useStorage from './common/storage';
import { SocketProvider } from './context/socketProvider';
import { registerUser, deleteRestaurantsFood } from './API';

function MainForm() {
	const { storage, setStorage } = useStorage();
	const { token, ...user } = storage;
	let history = useHistory();

	const LoginForm = () => <Login setStorage={setStorage} />;
	const MainWrapperWrapper = () => <MainWrapper user={{ ...user }} />;

	const RegisterForm = () => (
		<Register
			onSubmitRegister={async (event) => {
				event.preventDefault();
				const {
					target: {
						username,
						name,
						email,
						password,
						city,
						address,
						role: radioRole,
					},
				} = event;
				const user = {
					username: username.value,
					name: name.value,
					email: email.value,
					password: password.value,
					city: city.value,
					address: address.value,
				};
				const role = Array.from(radioRole).reduce(
					(acc, rl) => (rl.checked ? rl : acc),
					null
				).value;
				const response = await registerUser(role, user);
				if (response && response.status == 200) {
					console.log(response);
					const {
						data: { user, token },
					} = response;
					setStorage({
						...user,
						token,
						role:
							role.toString().charAt(0).toUpperCase() +
							role.toString().slice(1),
					});
					if (role == 'customer') history.push('/Home/Restaurants');
					else if (role == 'restaurant') history.push('/Home/Menu');
					else history.push('/Home/Orders');
				}
			}}
		/>
	);
	useEffect(() => {
		if (localStorage.getItem('token')) {
			const role = localStorage.getItem('role');
			if (role == 'Customer') history.push('/Home/Restaurants');
			else if (role == 'Restaurant') history.push('/Home/Menu');
			else history.push('/Home/Orders');
		}
	}, []);
	return (
		<Switch>
			<Route path="/Register" component={RegisterForm} />
			<Route path="/Home" component={MainWrapperWrapper} />
			<Route path="/" component={LoginForm} />
		</Switch>
	);
}

export default MainForm;
