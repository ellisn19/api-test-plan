const express = require('express');

const app = express();
app.use(express.json());

// Mock database
let users = [];

// Add a user
app.post('/users', (req, res) => {
	console.log('Received user data:', req.body);

	if (!req.body || Object.values(req.body).some((value) => value == null)) {
		console.log('Invalid user data:', req.body);
		res.status(400).send('All fields must be provided and non-null.');
	} else {
		const id = Math.floor(Math.random() * 1_000_000);
		const user = { id: id, ...req.body };
		users.push(user);
		res.status(201).json(user);
	}
	console.log('Current users:', users);
});

app.listen(3000, () => console.log('API running on http://localhost:3000'));
