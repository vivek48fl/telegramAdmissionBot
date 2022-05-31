const { telegramReply, checkUser } = require("./helperFunctions");
const { checkChannel } = require("../util/checkChannel");
let id;

const defaultWelcomeIntent = async (conv) => {
	const channel = checkChannel(conv);

	if (channel == "google") {
		id = conv.request.user.accessToken;
	} else {
		id = conv.request.data.chat.id;
	}
	console.log("conv id for google assistant", id);
	const status = await checkUser(id);
	if (status == true) {
		if (channel == "google") {
			conv.json({
				payload: {
					google: {
						expectedUserInput: true,
						richResponse: {
							items: [
								{
									simpleResponse: {
										textToSpeech:
											"Hello,How may I help you You are already registered with us",
									},
								},
							],
							suggestions: [
								{ title: "Admission inquiry" },
								{ title: "FAQ" },
							],
						},
					},
				},
			});
		} else if (channel == "telegram") {
			let quickReplies = ["AdmissionBot admission 2022"];
			// if telegram
			conv.json(
				telegramReply(
					[
						"Hello,How may I help you",
						"You are already registered with us",
					],
					"Markdown",
					quickReplies,
					null
				)
			);
		} else {
			conv.json({ message: "unknown pltform" });
		}
	} else {
		// if user doesn't have registered'

		if (channel == "teleram") {
			let welcomeText = "Welcome to AdmissionBot";
			let text2 =
				"You are not authenticated Please enter mobile number or email address";
			conv.json(telegramReply([welcomeText, text2], "Markdown", null));
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
											"You are not authenticated please click on Login",
									},
								},
							],
							suggestions: [{ title: "LOGIN" }],
						},
					},
				},
			});
		} else {
			conv.json({ message: "unknown pltform" });
		}
	}

	//	createUser(chatId);
};

//console.log(conv, "conv in WelcomeIntent");

module.exports = { defaultWelcomeIntent };
