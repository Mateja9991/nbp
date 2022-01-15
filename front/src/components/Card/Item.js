import React, { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RestaurantMenuPage } from '../../pages';
import { Button } from '../Button';
import { url } from '../../constants/constants';
function Item({
	button: { icon, onClick } = {},
	id,
	name,
	onSelect,
	setForReview,
	overwriteHtml,
	...restProps
}) {
	const imgSrc = `${url}/img/${id}.jpg`;
	const ref = useRef();
	const description = 'Description';
	const parseKey = (key) => {
		return (key.charAt(0).toUpperCase() + key.slice(1))
			.match(/[A-Z][a-z]+/g)
			.join(' ');
	};
	let extra;
	// if (address) extra = address;
	// else if (price) extra = price;
	return (
		<div key={id} className={overwriteHtml ? 'ui items formItem' : 'ui items'}>
			{overwriteHtml ? (
				overwriteHtml
			) : (
				<div className="item">
					<div ref={ref} class="image">
						<img
							src={imgSrc}
							onError={({ currentTarget }) => {
								console.log('doso');
								currentTarget.onerror = null;
								currentTarget.src = `${url}/img/no_img_avalable.jpg`;
							}}
						/>
					</div>
					<div class="content">
						<a onClick={() => onSelect(id)} class="header">
							{name}
						</a>
						{/* <div class="meta">
							<span>{description}</span>
						</div>
						<div class="description">
							<p></p>
						</div> */}
						{restProps
							? Object.keys(restProps).map((key) => (
									<div className="extra">
										<strong>{`${parseKey(key)}:`}</strong>
										{`${restProps[key]}`}
									</div>
							  ))
							: ''}
						{setForReview ? (
							<div
								class="ui label"
								style={{ cursor: 'pointer', 'margin-top': '2%' }}
								onClick={() => setForReview(id)}
							>
								<i class="star icon"></i>
								Revievs
							</div>
						) : (
							''
						)}
					</div>
					<Button
						icon={icon}
						onClick={() => {
							onClick(id);
						}}
					/>
				</div>
			)}
		</div>
	);
}

export default Item;
