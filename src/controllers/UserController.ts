import type { Context } from 'hono';
import userService from '../services/UserService.ts';
import { jwtDataGetters } from '../utils.ts';

class UserController {
	logIn = async (c: Context) => {
		const body = await c.req.json();
		const { email, password } = body;

		const { userExists, isPasswordValid, token, user } = await userService.logIn(email, password);
		if (userExists === false) {
			c.status(400);
			return c.json({ message: 'user with this email does not exist.' });
		}
		if (isPasswordValid === false) {
			c.status(400);
			return c.json({ message: 'password is invalid.' });
		}

		c.status(200);
		return c.json({ message: 'user was successfully logged in.', token, user });
	};

	// also sign up
	sendOtp = async (c: Context) => {
		const body = await c.req.json();

		const { email } = body;
		const { userExists, OTP_TTL } = await userService.sendOtp(email);
		if (userExists === true) {
			return c.json({ OTP_TTL }, 200);
		}

		return c.json({ message: "user with such email doesn't exist in our database." }, 400);
	};

	checkOtp = async (c: Context) => {
		const body = await c.req.json();
		const { email, otp } = body;

		const { userExists, isOtpSent, isExpired, isOtpValid, token } = await userService.checkOtp(email, otp);
		if (userExists === false) {
			return c.json({ message: "user with such email doesn't exist in our database." }, 400);
		}

		if (isOtpSent) {
			if (isExpired) {
				return c.json({ message: 'otp was expired.' }, 400);
			}

			if (isOtpValid) {
				return c.json({ message: 'otp is valid.', token }, 200);
			}

			return c.json({ message: 'otp is invalid.' }, 400);
		}

		return c.json({ message: 'otp was not sent.' }, 400);
	};

	getUser = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const { userExists, user } = await userService.getUser(userId);

		if (userExists === true) {
			return c.json({ user }, 200);
		}

		return c.json({ message: 'user does not exist in our database.' }, 400);
	};

	changePassword = async (c: Context) => {
		const body = await c.req.json();
		const { password } = body;
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const { userExists } = await userService.changePassword(userId, password);
		if (userExists === true) {
			return c.json({ message: 'password was successfully changed.' }, 200);
		}

		return c.json({ message: 'user does not exist in our database.' }, 400);
	};
}

export default new UserController();
