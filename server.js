const { saveGoogleTokenToDB } = require("./botagent/helperFunctions");
const { nanoid } = require("nanoid");
const express = require("express");

const bodyParser = require("body-parser");

const path = require("path");
//require("dotenv").config(__dirname, path.resolve("./"));
//require("dotenv").config();
const server = express();
const { admiAgent } = require("./botagent/agent");
/*server.use(express.json()).get("/", (req, res) => {
	res.status(200).json({
		message: "GET not supported",
	});
});
*/
server.use(express.json()).post("/fulfillment", admiAgent);
server.use(
	bodyParser.urlencoded({
		extended: false,
	})
);

server.use(bodyParser.json());

server.listen(8080, async () => {
	console.log("sxca bot is running on port 8080");
});
//code to generate unique tokens

server.use(express.json());
// for token
server.get("/", function (req, res) {
	console.log(req.query);
	let html_data = `
	<head>
	<script src="https://cdn.tailwindcss.com"></script>
	</head>
	<center>
	 <div> <form action='saved_details' method='post'> 
		
		<div class='text-center'>
		<img
			src="https://i.ibb.co/X4GFVwq/Logo-Word-Mark-Light-BG.png"
			style="width: 200px"
		/>
		<h2 style="font-weight: 400; margin-bottom: 40px">
			User Login Form
		</h2>
	</div>
		<label for="name">Name</label>&nbsp;
		<input type='text' placeholder='Enter your name' name='name' /> <br /> <br />
		<label for="email">Email</label>&nbsp;
		<input type='email' placeholder='Enter your email' name='email' /> <br /> <br />
	
		<input type='hidden' value= 
		${req.query.redirect_uri} 
		name='redirect_uri' >

		<input type='hidden' value=  ${req.query.state} name='state' >
	 <input type='submit' value='Submit'class='bg-lime-500 hover: bg-lime-600 p-2' />
	</form> </div> </center>
	
		<span style="font-size:16px">  ${req.query.redirect_uri} </span>`;
	res.send(html_data);
});

// this function will be call on above form submit
// save the necessary details

server.post("/saved_details", async function (req, res) {
	let email = req.body.email;
	let password = req.body.password;
	// Generate token
	const token = nanoid(20);
	const state = await req.body.state;
	const insertedId = await saveGoogleTokenToDB(email, token);
	const redirect_str = `https://oauth-redirect.googleusercontent.com/r/admissionbot-pmtf#access_token=${token}&token_type=bearer&state=${state}`;
	// redirecting user back to the agent
	res.redirect(redirect_str);
});
