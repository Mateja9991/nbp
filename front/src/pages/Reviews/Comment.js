import react, { useState } from 'react';
import { Rating } from 'semantic-ui-react';
import { AvatarGenerator } from 'random-avatar-generator';
const generator = new AvatarGenerator();
function Comment({ customerName, time, text, rating }) {
	const avatar = generator.generateRandomAvatar(
		customerName ? customerName : 'avatar'
	);
	console.log(rating);
	console.log(new Date(time));
	const date = time ? new Date(parseInt(time)) : '';
	const parsedDate = date
		? `${date.getFullYear()}/${
				date.getMonth() + 1
		  }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
		: '';
	const stars = [...Array(rating)].map((item, index) =>
		index > 4 ? '' : <i class="star icon"></i>
	);
	console.log(parsedDate);
	console.log(stars);
	return (
		<div class="comment">
			<div>
				<a class="avatar">
					<img src={avatar} />
				</a>
			</div>
			<div class="content">
				<a class="author">{customerName}</a>
				<div class="metadata">
					<span class="date">{parsedDate}</span>
				</div>
				<div class="text">{text}</div>
				<div>{stars}</div>
			</div>
		</div>
	);
}

export default Comment;
