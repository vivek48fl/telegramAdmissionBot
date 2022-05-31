const { clientPromise } = require("../lib/mongodb");
const {
	telegramReply,
	checkUser,
	checkExistingToken,
	saveOTPToDB,
} = require("./helperFunctions");
const { sendMail } = require("../lib/sendMail");
const { checkChannel } = require("../util/checkChannel");

const askForEmail = async (conv) => {
	let id;

	let otp;
	let status;
	let result;
	const channel = checkChannel(conv);
	console.log(channel, "channel: ");

	const email = conv.contexts.input.email.parameters.email;

	if (channel == "telegram") {
		id = conv.request.data.chat.id;
		// 2) check telegram user
		status = await checkUser(id);
		console.log(status, "status of checkUser");
	} else {
		// google
		id = conv.id;
		status = await checkUser(id);
		console.log(status, "status of checkUser");

		//google reply*/
	}
	console.log("status", status);
	if (status == false) {
		// 1) Generate otp
		otp = Math.floor(Math.random() * 900000);
		console.log("otp generated in ask email user", otp);
		const tokenStatus = await checkExistingToken(id);
		if (tokenStatus == true) {
			const client = await clientPromise;
			const db = await client.db("test");
			// delete existing Otp
			const prevTokenDelete = await db.collection("tokens").deleteMany({
				id: id,
			});
			console.log("---------prevTokenDelete", prevTokenDelete);
			// Now generate new otp token
			result = await saveOTPToDB(otp, id);
			if (result.insertedId) {
				// send token to user through email
				sendMail({
					from: "Admission bot otp",
					to: email,
					subject: "OTP for admission bot",
					html: `<p>Your OTP is ${otp} for admission bot</p>`,
				});
			}
			if (channel == "telegram") {
				conv.json(
					telegramReply(
						[
							`Your email is ${email}`,
							"Please enter Otp sent to your email",
						],
						"Markdown",
						null
					)
				);
			} else if (channel == "google") {
				conv.json({
					payload: {
						google: {
							expectUserResponse: true,
							richResponse: {
								items: [
									{
										simpleResponse: {
											textToSpeech: `Your email is ${email} Please enter Otp sent to your email`,
										},
									},
								],
							},
						},
					},
				});
			} else {
				conv.json({ message: "unknown platform" });
			}
		} else {
			// 1) Generate otp
			otp = Math.floor(Math.random() * 900000);
			// Now generate new otp token
			result = await saveOTPToDB(otp, id);
			if (result.insertedId) {
				// send token to user through email
				sendMail({
					from: "Admission bot otp",
					to: email,
					subject: "OTP for admission bot",
					html: `<p>Your OTP is ${otp} for admission bot</p>`,
				});
			}
			if (channel == "telegram") {
				conv.json(
					telegramReply(
						[
							`Your email is ${email}`,
							"Please enter Otp sent to your email",
						],
						"Markdown",
						null
					)
				);
			} else {
				conv.json({
					payload: {
						google: {
							expectUserResponse: true,
							richResponse: {
								items: [
									{
										simpleResponse: {
											textToSpeech: `Your email is ${email} Please enter Otp sent to your email`,
										},
									},
								],
							},
						},
					},
				});
			}
		}
	}
};

module.exports = { askForEmail };
