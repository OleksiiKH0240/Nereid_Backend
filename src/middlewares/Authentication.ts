import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { jwtDataGetters } from '../utils.ts';

export const authenticate = async (c: Context, next: Next) => {
	let token = c.req.header('authorization');
	if (token === undefined) {
		return c.json({
			message: 'no access token was provided.',
		}, 400);
	}

	token = token.includes('Bearer ') ? token.split(' ')[1]! : token;
	const { JWT_SECRET } = process.env;
	try {
		jwt.verify(token, JWT_SECRET!);
		return await next();
	} catch {
		return c.json({ message: 'Invalid token.' }, 400);
	}
};

export const adminValidation = async (c: Context, next: Next) => {
	const token = c.req.header('authorization')!;
	const roleName = jwtDataGetters.getRoleName(token);
	if (roleName !== 'admin') {
		return c.json({
			message: "you don't have 'admin' role.",
		}, 400);
	}

	return await next();
};

export const teacherValidation = async (c: Context, next: Next) => {
	const token = c.req.header('authorization')!;
	const roleName = jwtDataGetters.getRoleName(token);
	if (roleName !== 'teacher') {
		return c.json({
			message: "you don't have 'teacher' role.",
		}, 400);
	}

	return await next();
};

export const studentValidation = async (c: Context, next: Next) => {
	const token = c.req.header('authorization')!;
	const roleName = jwtDataGetters.getRoleName(token);
	if (roleName !== 'student') {
		return c.json({
			message: "you don't have 'student' role.",
		}, 400);
	}

	return await next();
};
