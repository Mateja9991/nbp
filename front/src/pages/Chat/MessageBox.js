import react, { useEffect, useRef, useState } from 'react';
import '../../styles/Chat.css';
import Message from './Message';
import { getMessageHistoryWithUser } from '../../API';
import { useSocket } from '../../context/socketProvider';

function MessageBox({ selected: user }) {
	const inputRef = useRef();
	const [messages, setMessages] = useState([]);
	const [skip, setSkip] = useState(0);
	const [plus, setPlus] = useState(true);
	const limit = 10;
	let newMessageListener;
	const socket = useSocket();

	useEffect(() => {
		if (socket) {
			if (newMessageListener) socket.off('new-message', newMessageListener);
			newMessageListener = (payload) => {
				if (!user) return;

				const { senderId, msg } = JSON.parse(payload);
				if (senderId != user.id) return;
				const msgElement = {
					id: messages.length,
					text: msg,
					dirFlag: false,
					createdAt: Date.now(),
					from: senderId,
				};
				setMessages([...messages, msgElement]);
			};
			socket.on('new-message', newMessageListener);
		}
	}, [messages, user]);
	useEffect(() => {
		if (user) {
			getMessageHistoryWithUser(user.id, { limit, skip })
				.then(({ data }) => {
					if (messages) {
						setMessages([
							...data.map((msg, ind) => ({
								id: ind,
								text: msg.text,
								dirFlag: msg.from != user.id,
								createdAt: msg.createdAt,
								from: msg.from,
							})),
							...messages,
						]);
					} else {
						setMessages(
							data.map((msg, ind) => ({
								id: ind,
								text: msg.text,
								dirFlag: msg.from != user.id,
								createdAt: msg.createdAt,
								from: msg.from,
							}))
						);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}

		return () => {
			if (socket && newMessageListener) {
				socket.off('new-message', newMessageListener);
			}
		};
	}, [user, skip]);
	const sendMessage = () => {
		if (user != null) {
			if (inputRef.current.value != null && inputRef.current.value != '') {
				if (socket) {
					socket.emit('newMessageToUser', user.username, {
						senderId: localStorage.getItem('id'),
						msg: inputRef.current.value,
					});
				}
				const msg = {
					_id: messages.length + 1,
					text: inputRef.current.value,
					dirFlag: true,
				};
				if (messages != null) {
					setMessages([...messages, msg]);
				} else {
					setMessages([msg]);
				}
				inputRef.current.value = '';
			} else alert('Ne mozete poslati praznu poruku.');
		} else alert('Morati izabrati korisnika kome zelite da posaljete poruku.');
	};

	var messageList;
	if (messages != null) {
		messageList = messages.map(({ id, text, dirFlag }) => {
			return <Message key={id} dirFlag={dirFlag} text={text} />;
		});
	} else {
		messageList = '';
	}

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			sendMessage();
		}
	};
	return (
		<div className="messageBox">
			<div className="char-user-label">
				{user != null ? <a class="ui basic label"> {user.username} </a> : ''}
			</div>
			<div className="plusIconWrapper">
				{plus && user ? (
					<i
						class="big plus circle icon"
						style={{ cursor: 'pointer' }}
						onClick={() => {
							setSkip(skip + limit);
						}}
					></i>
				) : (
					''
				)}
			</div>
			<div className="messages">{messageList}</div>

			<div className="textBox">
				<div class=" ui input">
					<input
						type="text"
						placeholder="Enter message..."
						ref={inputRef}
						onKeyDown={handleKeyDown}
					/>
				</div>
			</div>
		</div>
	);
}

export default MessageBox;
