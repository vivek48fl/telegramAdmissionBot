const nodemailer = require("nodemailer");
const nodemailerConfig = {
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	service: "gmail",
	auth: {
		user: `${process.env.NODEMAILER_CONFIG_EMAIL}`,
		pass: `${process.env.NODEMAILER_CONFIG_PASSWORD}`,
	},
};

const transporter = nodemailer.createTransport(nodemailerConfig);

async function sendMail({ from, to, subject, html }) {
	const mailOptions = {
		from: {
			name: "ILA for Placements",
			address: from,
		},
		to,
		subject,
		html,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.log(error);
	}
}

module.exports = { sendMail };
