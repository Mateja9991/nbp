import React, { useState, useContext } from 'react';
import { loginAsUser } from '../API/Users';
import '../styles/Login.css';
import { url } from '../constants/constants.js';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

function Login({ setStorage }) {
	//const [user, setUser] = useContext(UserContext);
	const [userName, setUserName] = useState(null);
	const [password, setPassword] = useState(null);
	const history = useHistory();

	const submitLogin = async (e) => {
		e.preventDefault();
		const {
			data: { user, token },
		} = await loginAsUser({
			username: userName,
			password: password,
		});
		if (token) {
			console.log(user);
			setStorage({ ...user, token });
			if (user.role == 'Customer') history.push('/Home/Restaurants');
			else if (user.role == 'Restaurant') history.push('/Home/Menu');
			else if (user.role == 'RestaurantInstance') history.push('/Home/Orders');
			else history.push('/Home/Orders');
		}
	};
	return (
		<div className="pageWrapper">
			<div class="page-login">
				<div class="ui centered grid container">
					<div class="nine wide column">
						<div class="ui fluid card">
							<div class="content">
								<form class="ui form">
									<div class="field">
										<label>User</label>
										<input
											type="text"
											name="user"
											placeholder="User"
											onChange={(e) => setUserName(e.target.value)}
										/>
									</div>
									<div class="field">
										<label>Password</label>
										<input
											type="password"
											name="pass"
											placeholder="Password"
											onChange={(e) => setPassword(e.target.value)}
										/>
									</div>
									<div className="buttons">
										<button
											class="ui primary labeled icon button"
											onClick={submitLogin}
										>
											<i class="unlock alternate icon"></i>
											Login
										</button>
										<Link to="/Register">
											<button type="button" class="orange ui button">
												Register
											</button>
										</Link>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;
