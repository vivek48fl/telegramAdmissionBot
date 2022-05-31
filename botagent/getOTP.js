const {
	telegramReply,
	checkExistingToken,
	isOTPExpired,
	saveOTPToDB,
} = require("./helperFunctions");
const { sendMail } = require("../lib/sendMail");
const { clientPromise } = require("../lib/mongodb");
const { otpExpiryMobile } = require("./AskForMobileNumber");
const { checkChannel } = require("../util/checkChannel");

const getOTP = async (conv) => {
	let id;
	const channel = checkChannel(conv);
	if (channel == "telegram") {
		id = conv.request.data.chat.id;
	} else {
		id = conv.id;
	}

	const email = conv.contexts.input.email.parameters.email;

	const userOtp = conv.contexts.input.otp.parameters.number;
	console.log("user otp in getOTP intent", userOtp);

	const client = await clientPromise;
	const db = await client.db("test");
	const collection = await db.collection("tokens");
	const obj = await collection.findOne({ id: id });
	console.log(obj, "in getOTP intent");

	const otpExpiry = obj.expireAt;
	console.log(otpExpiry, "obj.ExpireAt in getOTP intent");

	/*conv.json(telegramReply(["Ok"], "html"));*/

	if (obj) {
		const quickReply = ["Admission Bot 2022"];

		console.log(
			"Expiry time from askForMobileNumber intent ---> ",
			otpExpiryMobile
		);

		console.log("Expiry time from askForEmail intent ---> ", otpExpiry);

		console.log("isOTPExpired? ---> ", isOTPExpired(otpExpiry));
		console.log(
			"---------> obj.otp in getOTP intent",
			obj.otp,
			"userOtp in getOTP intent",
			userOtp
		);

		if (userOtp == obj.otp && isOTPExpired(otpExpiry)) {
			const updateResult = await db
				.collection("users")
				.insertOne({ id: id, email: email, verified: true });
			console.log("otp is matched");
			const tokenStatus = await checkExistingToken(id);
			if (tokenStatus == true) {
				// delete existing Otp
				await db.collection("tokens").deleteMany({
					id: id,
				});
			}
			if (channel == "telegram") {
				conv.json(
					telegramReply(
						["Your are authenticated"],
						"Markdown",
						quickReply
					)
				);
			} else {
				// if channel is googleAssistant
				conv.json({
					payload: {
						google: {
							expectUserResponse: true,
							richResponse: {
								items: [
									{
										simpleResponse: {
											textToSpeech:
												"You are authenticated",
										},
									},
									{
										basicCard: {
											title: "Branches",

											/*formattedText:
													'This is a basic card.  Text in a basic card can include "quotes" and\n    most other unicode characters including emojis.  Basic cards also support\n    some markdown formatting like *emphasis* or _italics_, **strong** or\n    __bold__, and ***bold itallic*** or ___strong emphasis___ as well as other\n    things like line  \nbreaks',*/
											image: {
												url: "https://storage.googleapis.com/actionsresources/logo_assistant_2x_64dp.png",
												accessibilityText:
													"Image alternate text",
											},
											buttons: [
												{
													title: "This is a button",
													openUrlAction: {
														url: "https://assistant.google.com/",
													},
												},
											],
											imageDisplayOptions: "CROPPED",
										},
									},
									{
										simpleResponse: {
											textToSpeech:
												"Which response would you like to see next?",
										},
									},
								],
								suggestions: [
									{ title: "CS/IT" },
									{ title: "Medical" },
									{ title: "Admission bot" },
								],
							},
						},
					},
				});
			}
		} else {
			if (isOTPExpired(otpExpiry) == false) {
				const existingTokenStatus = await checkExistingToken(id);
				if (existingTokenStatus == true) {
					console.log(
						"delete existing token in getOTP intent time expiriy"
					);

					await db.collection("tokens").deleteMany({
						id: id,
					});
				}
				// Now Regenerate otp
				const otp = Math.floor(Math.random() * 900000);
				const insertResponse = await saveOTPToDB(otp, id);
				if (insertResponse.insertedId) {
					sendMail({
						from: "Admission bot otp",
						to: email,
						subject: "OTP for admission bot",
						html: `<p>Your OTP is ${otp} for admission bot</p>`,
					});
					if (channel == "telegram") {
						conv.json(
							telegramReply(
								[
									"otp has expired",
									"The otp is regenerated and sent to your email",
									"please enter new otp",
								],
								"Markdown",
								null
							)
						);
					} else if (channel == "google") {
						//if channel is googleAssistant
						conv.json({
							payload: {
								google: {
									expectUserResponse: true,
									richResponse: {
										items: [
											{
												simpleResponse: {
													textToSpeech:
														"otp has expired The otp is regenerated and sent to your email please enter new otp",
												},
											},
										],
									},
								},
							},
						});
					}
				} else {
					conv.json({ message: "unknown platform" });
				}
			} else {
				if (channel == "telegram") {
					conv.json(
						telegramReply(
							["Please enter valid one time password"],
							"Markdown",
							null
						)
					);
				} else if (channel == "google") {
					console.log("else if channel is google");
					conv.json({
						payload: {
							google: {
								expectUserResponse: true,
								richResponse: {
									items: [
										{
											simpleResponse: {
												textToSpeech:
													"Please enter valid otp",
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
	}
};
module.exports = { getOTP };
