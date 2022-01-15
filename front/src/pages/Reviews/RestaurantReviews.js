import react, { useEffect, useState, useRef } from 'react';
import Comment from './Comment';
import { List } from 'semantic-ui-react';
import { Rating } from 'semantic-ui-react';
import { getReviews, rateRestaurant } from '../../API';
function RestaurantReviews({ restId, role, rating }) {
	const [comments, setComments] = useState([]);
	// const stars = [...Array(rating)].map((item, index) =>
	// 	index > 4 ? '' : <i class="star icon"></i>
	// );
	const [skip, setSkip] = useState(0);
	const [plus, setPlus] = useState(true);
	const limit = 1;
	const ratingRef = useRef(3);
	const updateItems = async () => {
		getReviews(restId, { limit, skip })
			.then(({ data }) => {
				console.log(data);
				if (comments) setComments([...comments, ...data]);
				else setComments(data);
			})
			.catch((err) => console.log(err));
	};
	useEffect(() => {
		updateItems();
	}, [skip]);
	const CommentForm = () =>
		role === 'Customer' ? (
			<div>
				<form
					sytle={{ border: '3px solid black;', borderRadius: '30px;' }}
					class="ui reply form"
					onSubmit={(e) => {
						e.preventDefault();
						const {
							target: {
								text: { value: text },
							},
						} = e;
						const {
							current: { value: rating },
						} = ratingRef;
						console.log(`RATING IS ${rating} TEXT IS ${text}`);
						if (!rating) return alert('Please rate');
						rateRestaurant(restId, { text, rating })
							.then(({ data }) => {
								console.log(comments);
								console.log(`DATA IS ${JSON.stringify(data)}`);
								setComments(
									comments.map((comm) =>
										comm.customerName !== data.customerName ? comm : data
									)
								);
							})
							.catch((err) => alert(err.message));
					}}
				>
					<div ref={ratingRef} name="rating" class="field">
						<Rating
							onRate={(e, { rating }) => {
								ratingRef.current.value = rating;
							}}
							icon="star"
							defaultRating={3}
							maxRating={5}
						/>
					</div>
					<div class="field">
						<textarea name="text" className="custom-comment"></textarea>
					</div>
					<button class="ui blue labeled submit icon button" action="submit">
						<i class="icon edit"></i> Add Review
					</button>
				</form>
			</div>
		) : (
			''
		);

	return (
		<>
			{/* <div class="rating"></div> */}
			<div class="ui comments">
				<h3 class="ui dividing header">Reviews</h3>
				<List style={{ margin: '5%' }}>
					{comments.map((comm) => (
						<List.Item key={comm.id}>
							<Comment
								commId={comm.id}
								text={comm.text}
								rating={comm.rating}
								customerName={comm.customerName}
								time={comm.createdAt}
							></Comment>
						</List.Item>
					))}
				</List>
				<div className="plusIconWrapper">
					{plus ? (
						<i
							class="big plus circle icon"
							style={{ cursor: 'pointer' }}
							onClick={() => setSkip(skip + limit)}
						></i>
					) : (
						''
					)}
				</div>
				<CommentForm />
			</div>
		</>
	);
}

export default RestaurantReviews;
