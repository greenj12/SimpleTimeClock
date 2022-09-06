import { useEffect, useState } from 'react';

function TimeClock(props) {
	const {userId, role, status, shifts} = props.userData;

	const handleClick = (status) => {
		fetch('http://localhost:8080/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify({
				userId: userId,
				status: status,
			}),
		}).then(response => response.json())
			.then((json) => {
				if (json.error) {
					alert(json.error);
				} else {
					json.userId = userId;
					props.setUserData(json);
				}
				console.log(json);
		}).catch(error => {
			console.error(error);
		});
	};

	return (
		<div className='time-clock'>
			<div className='header'>
				<h1>
					Simple Time Clock
				</h1>
				<button 
					className='log-out'
					onClick={() => {props.setUserData(null)}}>
					Log Out
				</button>
			</div>
			<div className='info'>
				<Clock />
				<div className='user-id'>UserID: {userId}</div>
				<div className='status'>
					Current Status: {status.charAt(0).toUpperCase() + status.slice(1)}
				</div>
			</div>
			<div className='buttons'>
				<button 
					className='start'
					disabled={status !== 'off'}
					onClick={() => {handleClick('working')}}>
						Start a New Shift
				</button>
				<button
					className='break'
					disabled={status === 'off'}
					onClick={() => {
						status === 'break' ?
							handleClick('working') :
							handleClick('break')
					}}>
						{status === 'break' ? 
							'End a Break' :
							'Start a Break'}
				</button>
				<button
					className='lunch'
					disabled={status === 'off'}
					onClick={() => {
						status === 'lunch' ?
							handleClick('working') :
							handleClick('lunch')
					}}>
						{status === 'lunch' ? 
							'Finish Lunch' :
							'Start Lunch'}
				</button>
				<button
					className='end'
					disabled={status === 'off'}
					onClick={() => {handleClick('off')}}>
						End a Shift
				</button>
			</div>
			<div>
			{shifts.length > 0 ? 
				<Shift shift={shifts[shifts.length - 1]}/> : 
				''}
			</div>
		</div>
	);
}

// Simple clock component to show current time
function Clock() {
	const [date, setDate] = useState(new Date());
	const [timerId, setTimerId] = useState(null);

	const tick = () => {
		setDate(new Date());
	}

	// start the timer
	useEffect(() => {
		const timerId = setInterval(tick, 1000);
		setTimerId(timerId);
		// cleanup 
		return () => {clearInterval(timerId)}
	}, []);

	return (
		<div className='clock'>
			<h2>{date.toLocaleTimeString()}</h2>
		</div>
	);
}

const statusMsg = {
	first: 'Began a shift',
	working: 'Continued working',
	break: 'Started a break',
	lunch: 'Started lunch',
	off: 'Finished the shift'
}
function Shift(props) {
	const {shift} = props;
	return (
		<div className='shift'>
			{shift.map((entry, i) => (
					<div className='row' key={i}>
						<div className='status'>
							{i === 0 ? statusMsg.first : statusMsg[entry.status]}
						</div>
						<div className='time'>
							{entry.time}
						</div>
					</div>
				))}
		</div>
	);
}

export default TimeClock;