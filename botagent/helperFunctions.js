// function to construct Text fulfillment message
const { clientPromise } = require("../lib/mongodb");
let payload;
const telegramReply = (
	textList,
	parse_mode,
	quickReplies,
	cardObject,
	inlineButton
) => {
	let fulfillmentMessages = [];

	for (let i = 0; i < textList.length; i++) {
		payload = {
			payload: {
				telegram: {
					text: textList[i],
					parse_mode,
				},
			},
		};
		fulfillmentMessages.push(payload);
	}

	if (cardObject) {
		let { title, imageUri, buttons } = cardObject;
		console.log(
			"buttons array in cardObject in helper function----------",
			buttons
		);
		fulfillmentMessages.push({
			card: {
				title,
				imageUri,
				buttons,
			},
		});
	}

	quickReplies &&
		fulfillmentMessages.push({
			quickReplies: {
				title: "Choose an option",
				quickReplies,
			},
		});

	if (inlineButton) {
		const payload = {
			inline_keyboard: inlineButton,
		};
	}
	/*fulfillmentMessages[
		fulfillmentMessages.length - 2
	].payload.telegram.reply_markup = payload;*/

	return {
		fulfillmentMessages,
	};
};
/*const googleAssistantReply = (textList, card, suggestionItems) => {
	let items = [];

	for (let i = 0; i <= textList.length; i++) {
		items.push({
			simpleResponse: {
				textToSpeech: textList[i],
			},
		});
	}
	if (card) {
		console.log("card object in googleAssistantReply", card.image);
		const { title, image, buttons } = card;
		items.push({
			basicCard: {
				title: title,

				image: {
					url: image.url,
					accessibilityText: image.accessibilityText,
				},

				buttons: [buttons],
				imageDisplayOptions: "CROPPED",
			},
		});
	}

	let googlePayload = {
		payload: {
			google: {
				expectUserResponse: true,
				richResponse: {
					items: items,
				},
			},
		},
	};
	if (suggestionItems) {
		console.log("suggestionItems-------------", suggestionItems);
		googlePayload.payload.google.richResponse.suggestions = suggestionItems;
	}

	return googlePayload;
};*/
/*function generateOTP(length) {
	let result = "";
	const numbers = "0123456789";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const charactersAndNumbers = characters + numbers;
	const charactersAndNumbersLength = charactersAndNumbers.length;
	for (let i = 0; i < length; i++) {
		result +=
			charactersAndNumbers[
				Math.floor(Math.random() * charactersAndNumbersLength)
			];
	}
	return result;
}*/

const checkUser = async (id) => {
	const client = await clientPromise;
	const db = await client.db("test");
	const collection = await db.collection("users");
	const user = await collection.findOne({ id: id });
	console.log(user, "user doc in checkUser function");

	if (user != null) {
		return true;
	} else {
		return false;
	}
};
const checkExistingToken = async (id) => {
	const client = await clientPromise;
	const db = await client.db("test");
	const collection = await db.collection("tokens");
	const dbResponse = await collection.findOne({
		id: id,
	});

	console.log("dbResponse in checkExisting token()--------- ", dbResponse);
	return dbResponse != null ? true : false;
};
const isOTPExpired = (otpExpiry) => {
	console.log(otpExpiry, "OTP expiry in isOTPExpired()");
	if (otpExpiry) {
		return Date.now() <= otpExpiry;
	}
};
const saveGoogleTokenToDB = async (email, token) => {
	const client = await clientPromise;
	const db = await client.db("test");
	const collection = await db.collection("users");
	const dbResponse = await collection.insertOne({
		email: email,
		id: token,
	});
	if (dbResponse.insertedId) {
		return dbResponse.insertedId;
	}
};
const saveOTPToDB = async (otp, id) => {
	const client = await clientPromise;
	const db = await client.db("test");
	const result = await db.collection("tokens").insertOne({
		otp: otp,
		expireAt: Date.now() + 60 * 5000,
		id: id,
	});
	return result;
};
module.exports = {
	telegramReply,
	checkUser,
	checkExistingToken,
	isOTPExpired,
	saveOTPToDB,
	saveGoogleTokenToDB,
};
