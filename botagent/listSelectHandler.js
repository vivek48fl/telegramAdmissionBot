const listSelectHandler = (conv, params, option) => {
	const SELECTED_ITEM_RESPONSES = {
		SELECTION_KEY_1001:
			"The resume is usually one of the first items, along with a cover letter and/or an application, that a potential organisation reviews when considering a candidate. This may be considered the first step of the candidate's assessment since organisations typically use CVs/resumes to screen applicants and determine whether or not they are eligible for the next stage of the recruitment process (usually an interview).",
		SELECTION_KEY_1002: "You selected the Google Home!",
		SELECTION_KEY_1003: "You selected the Google Pixel!",
	};

	conv.ask(SELECTED_ITEM_RESPONSES[option]);
	conv.ask("Which response would you like to see next?");
};
module.exports = {
	listSelectHandler,
};
