const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');

const app = express();
app.use(bodyParser.json());

// a sample user database
const db = {
	users: {
		'1234': {
			role: 'user',
			status: 'off',
			shifts: [],
		},
		'1337': {
			role: 'admin',
			status: 'off',
			shifts: [],
		}
	}
};
const Status = [
	'off',
	'working',
	'break',
	'lunch',
];

// checks that a given userId exists in the database
const isUser = (userId) => {
	return userId !== undefined && 
		db.users[userId] !== null;
}

// checks that a giver userId exists as an admin
const isAdmin = (userId) => {
	return userId !== undefined && 
		db.users[userId] !== null &&
		db.users[userId].role === 'admin';
}

// returns a user
const getUser = (userId) => {
	return db.users[userId];
}

// a readable time stamp
const currentTime = () => {
	var time = new Date();
	return time.toLocaleTimeString();
}

// serves the react app from the build folder
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// gets the information for a user
// post is used as the sensative user info should be encoded in the message body
app.post('/user', (req, res) => {
	console.log('POST /user', req.body);
	if (isUser(req.body.userId)) {
		console.log('Success');
		res.json(getUser(req.body.userId));
	} else {
		console.log('Unknown User ID:', req.body.userId);
		res.status(404);
		res.json({error: 'Unknown User ID: ' + req.body.userId});
	}
});

// updates the current status of a user
app.post('/update', (req, res) => {
	console.log('POST /update', req.body);
	if (isUser(req.body.userId)) {
		if (req.body.status && Status.includes(req.body.status)) {
			const curStatus = db.users[req.body.userId].status;
			var errMsg = '';
			try {
				switch(req.body.status) {
					// start a new shift or end a break/lunch
					case 'working':
						if (curStatus === 'off') {
							// start a new shift
							db.users[req.body.userId].shifts.push([{status: 'working', time: currentTime()}]);
						} else if (curStatus !== 'working') {
							// end a break or lunch
							const curShift = db.users[req.body.userId].shifts[db.users[req.body.userId].shifts.length - 1];
							curShift.push({status: 'working', time: currentTime()});
						}
						break;
					// start a break
					case 'break':
						if (curStatus === 'off') {
							errMsg = 'You must begin a shift first.'
							throw errMsg; // error
						} else if (curStatus !== 'break') {
							const curShift = db.users[req.body.userId].shifts[db.users[req.body.userId].shifts.length - 1];
							curShift.push({status: 'break', time: currentTime()});
						}
						break;
					// start lunch
					case 'lunch':
						if (curStatus === 'off') {
							errMsg = 'You must begin a shift first.'
							throw errMsg; // error
						} else if (curStatus !== 'lunch') {
							const curShift = db.users[req.body.userId].shifts[db.users[req.body.userId].shifts.length - 1];
							curShift.push({status: 'lunch', time: currentTime()});
						}
						break;
					// end a shift
					case 'off':
						if (curStatus === 'break' || curStatus === 'lunch') {
							errMsg = 'You must end your '+curStatus+' before finishing your shift.'
							throw errMsg; // error
						} else if (curStatus === 'working') {
							const curShift = db.users[req.body.userId].shifts[db.users[req.body.userId].shifts.length - 1];
							curShift.push({status: 'off', time: currentTime()});
						}
						break;
				}
				// finally, update the current status
				db.users[req.body.userId].status = req.body.status;
				res.json(db.users[req.body.userId]);
				console.log('Success');
			// error message for illegal updates
			} catch (error) {
				console.log('ERROR:', errMsg);
				res.status(400);
				res.json({error: errMsg});
			}
		// error message for bad requests
		} else {
			console.log('Unrecognized status:', req.body.status);
			res.status(400);
			res.json({error: 'Unrecognized status: ' + req.body.status});
		}
	}
});

// returns the timecards of all users
// requires the current user to be an admin
app.post('/getAll', (req, res) => {
	console.log('GET /all', req.body);
	if (isAdmin(req.body.userId)) {
		res.json(db.users);
		console.log('Success');
	} else {
		console.log('Unauthorized request: ' + req.body.userId);
	}
});

// start the server
app.listen(8080, () => {
	console.log('server started on port 8080');
});
