const { Suggestions } = require("actions-on-google");
const { checkChannel } = require("../util/checkChannel");
const { telegramReply, checkUser } = require("./helperFunctions");
let id;
const getAdmisionInfo = async (conv) => {
	const invalidInputText = "Percentage can not be greater than 100";

	const { name } = conv.body.queryResult.parameters.name;
	const { percentage } = conv.body.queryResult.parameters;
	const channel = checkChannel(conv);
	console.log("channel in getAdmisionInfo " + channel);
	if (channel == "google") {
		id = conv.request.user.accessToken;
	} else {
		id = conv.request.data.chat.id;
		console.log("chat id telegram", id);
	}

	const status = await checkUser(id);

	if (status == true) {
		if (percentage >= "60") {
			const text1 = `Congratulations!!! ${name} you are eligible for addmission`;

			let inlineButton = [
				{
					text: "CS/IT",
					callback_data: "CS",
				},
				//[Markup.button.callback("CS/IT \u{1F604}", "CS/IT")],
			];
			if (channel == "telegram") {
				conv.json(
					telegramReply(
						[text1],
						"Markdown",

						["CS/IT", "Architect", "Automobiles", "Medical"],
						{
							title: "Branches",
							imageUri:
								"https://upload.wikimedia.org/wikipedia/commons/e/ee/Sample_abc.jpg",

							buttons: [
								{
									text: "Go to ILA CV Builder",
									description:
										"ILA CV builder AI based CV builder that assist you for good CV building",
									postback: "https://ilaforplacements.com/",
									//postback: `${API_URL}/pdf_made_by_ILA?file_id=${filename}`,
								},
							],
						},

						[inlineButton]
					)
				);
			} else if (channel == "google") {
				console.log("else if google");
				conv.json({
					payload: {
						google: {
							expectedUserInput: true,
							richResponse: {
								items: [
									{
										simpleResponse: {
											textToSpeech:
												"You are authenticated Please select your branch",
										},
									},
									{
										basicCard: {
											title: "Branches",
											subtitle:
												"Select branch for addmission",
											image: {
												url: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Sample_abc.jpg",
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
								],
								suggestions: [
									{ title: "CS/IT" },
									{ title: "Architect" },
									{ title: "Automobiles" },
									{ title: "Medical" },
								],
							},
						},
					},
				});
			} else {
				conv.json({ message: "Unknown platform" });
			}
		} else {
			if (percentage >= "100") {
				console.log("percentage >100");
				if (channel == "telegram") {
					conv.json(
						telegramReply(
							[invalidInputText],
							"Markdown",
							null,
							null,
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
													"Percentage can not be > 100",
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
			} else {
				if (channel == "telegram") {
					const text2 = `${name} you are not eligible for addmission your percentage must be greater than or equal to 60`;

					conv.json(
						telegramReply([text2], "Markdown", null, null, null)
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
												textToSpeech: `${name} you are not eligible for addmission your percentage must be greater than or equal to 60`,
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
module.exports = { getAdmisionInfo };
