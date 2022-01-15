import React, { useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { url } from '../constants/constants';
import SOCKET_EVENTS from '../constants/socket_events';
const SocketContext = React.createContext();

export function useSocket() {
	return useContext(SocketContext);
}

export function SocketProvider({ children }) {
	const [socket, setSocket] = useState();
	const token = localStorage.getItem('token');
	useEffect(() => {
		console.log('CREATING NEW SOCKET');
		const newSocket = io(url, {
			transports: ['websocket'], // https://stackoverflow.com/a/52180905/8987128
			upgrade: false,
			auth: {
				token: token,
			},
		});
		setSocket(newSocket);
		return () => {
			console.log('CLOSING THE SOCKET');
			newSocket.off();
			newSocket.disconnect();
		};
	}, []);
	useEffect(() => {
		if (!socket) return;
		const eventsToHandle = ['restaurants-unavailable', 'carriers-unavailable'];
		eventsToHandle.forEach((event) => {
			socket.off(event);
			socket.on(event, () => alert(event));
		});
		let intervalId = setInterval(() => {
			console.log('who am i?');
			if (socket) {
				socket.emit(
					'whoAmI',
					localStorage.getItem('username'),
					localStorage.getItem('id')
				);
			}
		}, 3000);
		return () => {
			clearInterval(intervalId);
		};
	}, [socket]);
	return (
		<SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
	);
}
