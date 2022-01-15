import React, { useState, useContext } from 'react';

function Button({ icon, onClick }) {
	return (
		<div class="button-component">
			<div onClick={onClick}>
				<i class={`${icon}`}></i>
			</div>
		</div>
	);
}

export default Button;
