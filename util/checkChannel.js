const checkChannel = (res) => {
	const channel = res.body.originalDetectIntentRequest.source;
	if (channel == "google") {
		chatId = res.id;
		console.log("conv id for google assistant", chatId);
		return "google";
	} else if (channel == "telegram") {
		return "telegram";
	} else if (channel == "facebook") {
		return "facebook";
	} else {
		return "unknown";
	}
};
module.exports = { checkChannel };
