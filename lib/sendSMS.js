const fast2sms = require("fast-two-sms");
const sendSMS = async (conatctNo, otp) => {
	var options = {
		authorization:
			"tpxJaFy3wcIiK0hbYmu5lVMWeEDSQTXf19RjPqNkUd7Aon6vCOsFM3JoemiX7zqUyrxElC9OnbK4tDa8",
		message: `Your otp for admission bot is ${otp}`,
		numbers: [`${conatctNo}`],
	};
	await fast2sms
		.sendMessage(options)
		.then((response) => {
			console.log("sms sent successfully");
		})
		.catch((err) => {
			console.log("unable to send message");
		}); //Asynchronous Function.
};
module.exports = { sendSMS };
