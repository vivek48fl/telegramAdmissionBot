const { telegramReply, checkUser, saveOTPToDB } = require("./helperFunctions");
const { sendSMS } = require("../lib/sendSMS");
const { clientPromise } = require("../lib/mongodb");

const askForMobileNumber = async (conv) => {
	const phone = conv.contexts.input.mobile.parameters.contact;
	let id;
	let insertResult;
	const channel = checkChannel(id);
	if (channel == "telegram") {
		id = conv.request.data.chat.id;
	} else {
		// If channel is google
		id = conv.id;
	}
	// 1) generate otp
	const otp = Math.floor(Math.random() * 900000);
	console.log("otp generated in AskForMobileNumber intent ---> ", otp);

	const status = await checkUser(id);
	// 3) save to database
	if (status == false) {
		const client = await clientPromise;
		const db = await client.db("test");

		const collection = await db.collection("users");
		const doc = await collection.insertOne({
			mobile: phone,
			id: id,
		});
		if (checkExistingToken(id) == true) {
			// delete existing Otp
			await db.collection("tokens").deleteOne({
				id: id,
			});
			// Now generate new otp token
			insertResult = await saveOTPToDB(otp, id);
		} else {
			// If no existing token then generate fresh token
			insertResult = await saveOTPToDB(otp, id);
		}
	}
	//4) send Sms
	if (insertResult.insertedId) {
		await sendSMS(phone, otp);
	}
	if (channel == "telegram") {
		conv.json(
			telegramReply(
				["Please enter otp sent to your mobile number"],
				"Markdown",
				null
			)
		);
	} else if (channel == "google") {
		conv.json({
			payload: {
				google: {
					expectedUserInput: true,
					richResponse: {
						items: [
							{
								simpleResponse: {
									textToSpeech:
										"Please enter otp sent to your mobile number",
								},
							},
						],
					},
				},
			},
		});
	} else {
		conv.json({ message: "Unknown platform" });
	}
};
module.exports = { askForMobileNumber };
