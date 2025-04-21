import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { roles } from '../schemas/roles.ts';
import { users } from '../schemas/users.ts';

class UserRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getUserById = async (userId: number) => {
		const result = await this.db
			.select()
			.from(users)
			.where(eq(users.id, userId));

		return result[0];
	};

	addUser = async (user: typeof users.$inferInsert) => {
		return await this.db
			.insert(users)
			.values(user)
			.returning({ id: users.id })
			.then((rows) => rows[0]!);
	};

	getUserByEmail = async (email: string) => {
		const result = await this.db
			.select({
				id: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				password: users.password,
				otp: users.otp,
				otpExpiredTimestamp: users.otpExpiredTimestamp,
				roleId: users.roleId,
				roleName: roles.name,
			})
			.from(users)
			.innerJoin(roles, eq(users.roleId, roles.id))
			.where(eq(users.email, email));

		return result[0];
	};

	editUserById = async (userId: number, user: Partial<typeof users.$inferInsert>) => {
		const isAnyFieldDefined = Object.values(user).some((value) => value !== undefined);

		if (isAnyFieldDefined === false) {
			return;
		}

		await this.db
			.update(users)
			.set(user)
			.where(eq(users.id, userId));
	};
}

export default new UserRep();
