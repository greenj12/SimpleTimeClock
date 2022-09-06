import {useState} from 'react';

function SignIn(props) {
	const [userId, setUserId] = useState('');

	const handleChange = (event) => {
		setUserId(event.target.value);
	}

	const handleSubmit = (event) => {
		event.preventDefault();
		fetch('http://localhost:8080/user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify({
				userId: userId
			}),
		}).then(response => response.json())
			.then((json) => {
				json.userId = userId;
				console.log('Received response:', json);
				props.setUserData(json);
		}).catch(error => {
			console.error(error);
		});
	}

	return (
		<div className='sign-in'>
			<h1>
				Simple Time Clock
			</h1>
			<div className='form'>
				<label>
					UserId:
					<input type="text" value={userId} onChange={handleChange} />
				</label>
				<button type="submit" onClick={handleSubmit}>
					Log In
				</button>
			</div>
		</div>
	);
}

export default SignIn;