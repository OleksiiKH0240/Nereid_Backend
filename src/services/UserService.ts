import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import userRep from '../database/repositories/UserRep.ts';
import bcrypt from "bcrypt";

const { GMAIL_MAILER_HOST, GMAIL_MAILER_PORT, GMAIL_MAILER_USERNAME, GMAIL_MAILER_PASSWORD } = process.env;
const transporter = nodemailer.createTransport({
	service: 'gmail',
	host: GMAIL_MAILER_HOST,
	port: Number(GMAIL_MAILER_PORT),
	secure: false,
	auth: {
		user: GMAIL_MAILER_USERNAME,
		pass: GMAIL_MAILER_PASSWORD,
	},
});

class UserService {
	generateOtp = () => {
		const otp = String(Math.min(Math.floor(100000 + Math.random() * 900000), 999999));

		// expressed in seconds
		const OTP_TTL = Number(process.env['OTP_TTL']);
		const otpExpiredTimestamp = new Date(Date.now() + (OTP_TTL * 1000));

		return { otp, otpExpiredTimestamp, OTP_TTL };
	};

	sendOtp = async (email: string) => {
		const user = await userRep.getUserByEmail(email);

		if (user === undefined) {
			return { userExists: false };
		} else {
			const { otp, otpExpiredTimestamp, OTP_TTL } = this.generateOtp();
			await userRep.changeUserById(user.id, { otp, otpExpiredTimestamp });

			await transporter.sendMail({
				from: { name: 'Nereid', address: `${GMAIL_MAILER_USERNAME}` },
				to: email,
				subject: 'Nereid OTP for password recover',
				text: `your OTP: ${otp}. your OTP will expire in ${OTP_TTL} seconds.`,
			});

			return { userExists: true, OTP_TTL };
		}
	};

	checkOtp = async (email: string, submittedOtp: string) => {
		const user = await userRep.getUserByEmail(email);
		if (user === undefined) {
			return { userExists: false };
		}

		const { id, otp, otpExpiredTimestamp } = user;

		if (otp !== null && otpExpiredTimestamp !== null) {
			const now = new Date();
			if (now <= otpExpiredTimestamp) {
				if (submittedOtp === otp) {
					await userRep.changeUserById(id, { otp: null, otpExpiredTimestamp: null });

					const ttl = Number(process.env['JWT_TTL']);
					const JWT_SECRET = String(process.env['JWT_SECRET']);

					const token = jwt.sign(
						{
							userId: id,
						},
						JWT_SECRET,
						{ expiresIn: ttl },
					);

					return { isOtpSent: true, isExpired: false, isOtpValid: true, token };
				}

				return { isOtpSent: true, isExpired: false, isOtpValid: false };
			}

			return { isOtpSent: true, isExpired: true };
		}

		return { isOtpSent: false };
	};

	logIn = async (email: string, password: string) => {
		const user = await userRep.getUserByEmail(email);
		if (user === undefined) {
			return {
				userExists: false,
				isPasswordValid: undefined,
				token: undefined,
			};
		}

		let isPasswordValid: boolean;
		if (user.password.match(/^\d+/) === null) {
			isPasswordValid = await bcrypt.compare(password, user.password);
		} else {
			// test users case
			isPasswordValid = user.password === password ? true : false;
		}

		if (isPasswordValid) {
			const ttl = Number(process.env['JWT_TTL']);
			const JWT_SECRET = String(process.env['JWT_SECRET']);

			const token = jwt.sign(
				{
					userId: user.id,
				},
				JWT_SECRET,
				{ expiresIn: ttl },
			);

			const {
                otp: _1,
                otpExpiredTimestamp: _2,
				password: _3,
				...filteredUser
			} = user;

			return {
				userExists: true,
				isPasswordValid: true,
				token,
				user: filteredUser,
			};
		}

		return {
			userExists: true,
			isPasswordValid: false,
			token: undefined,
		};
	};

	getUser = async (userId: number) => {
		const user = await userRep.getUserById(userId);
		if (user === undefined) {
			return { userExists: false };
		}

		const { otp: _1, otpExpiredTimestamp: _2, password: _3, ...filteredUser } = user;
		return { userExists: true, user: filteredUser };
	};

    changePassword = async (userId: number, password: string) => {
        const saltRounds = Number(process.env['SALT_ROUNDS']);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await userRep.changeUserById(userId, {password: hashedPassword});
        if (user === undefined) {
            return {userExists: false};
        }

        return {userExists: true};
    
    }
}

export default new UserService();