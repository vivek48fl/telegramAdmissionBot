const { dialogflow, SignIn, List, Image } = require("actions-on-google");
const { defaultWelcomeIntent } = require("./welcomeIntent");
const { getAdmisionInfo } = require("./getAdmisionInfo");
const { getOTP } = require("./getOTP");
const { askForMobileNumber } = require("./askForMobileNumber");
const { listSelectHandler } = require("./listSelectHandler");

//const { googleAssistantSignup } = require("./googleAssistantSignup");
const { askForEmail } = require("./askForEmail");
const { clientPromise } = require("../lib/mongodb");
const admiAgent = dialogflow({ debug: false });
admiAgent.intent("default-welcome-intent", (conv) =>
	defaultWelcomeIntent(conv)
);
admiAgent.intent("getSignIn", async (conv) => {
	console.log("after google signup");
	console.log(
		conv,
		"------------------------------------------------conv obj in sign-up intent handler"
	);
	if (conv.request.user.accessToken) {
		conv.ask("Congratulations! You have already authenticated with google");
		const client = await clientPromise;
		const db = await client.db("test");
		const insertResult = await db
			.collection("users")
			.insertOne({ id: conv.request.user.accessToken });
	} else {
		conv.ask(new SignIn("Please Login"));
	}
});
admiAgent.intent("AskForMobileNumber", (conv) => askForMobileNumber(conv));
admiAgent.intent("AskForEmail", (conv) => askForEmail(conv));
admiAgent.intent("GetAdmissionInfo", (conv) => getAdmisionInfo(conv));

admiAgent.intent("getOTP", (conv) => getOTP(conv));
admiAgent.intent("ListSelectHandler", (conv) => listSelectHandler(conv));
admiAgent.intent("FAQ", (conv) => {
	conv.ask("Please select a FAQ");
	conv.ask(
		new List({
			title: "List Title",
			items: {
				// Add the first item to the list
				SELECTION_KEY_1001: {
					synonyms: [
						"1001",
						"What is the significance of a resume / CV document?",
					],
					title: "significance of cv/resume?",
					description: "",
					image: new Image({
						url: "https://storage.googleapis.com/actionsresources/logo_assistant_2x_64dp.png",
						alt: "CV Tips Fundamental",
					}),
				},
				// Add the second item to the list
				SELECTION_KEY_1002: {
					synonyms: ["1002", "Freshers CV FAQ ?"],
					title: " Freshers CV FAQ",
					description: "",
					image: new Image({
						url: "https://storage.googleapis.com/actionsresources/logo_assistant_2x_64dp.png",
						alt: "CV Tips Fundamentals",
					}),
				},
				// Add the third item to the list
				SELECTION_KEY_1003: {
					synonyms: ["1003", "What is ATS?"],
					title: "What is ATS?",
					description: "",
					image: new Image({
						url: "https://storage.googleapis.com/actionsresources/logo_assistant_2x_64dp.png",
						alt: "CV Tips Fundamentals",
					}),
				},
			},
		})
	);
});

module.exports = { admiAgent };
