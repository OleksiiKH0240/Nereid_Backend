import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { roles } from '../schemas/roles.ts';

class RoleRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getAllRoles = async () => {
		const result = await this.db
			.select()
			.from(roles);

		return result;
	};

	deleteAllRoles = async () => {
		await this.db.delete(roles);
	};

	addRoles = async (rolesToAdd: (typeof roles.$inferInsert)[]) => {
		await this.db.insert(roles).values(rolesToAdd);
	};

	getRoleByName = async (roleName: string) => {
		const role = await this.db
			.select()
			.from(roles)
			.where(
				eq(roles.name, roleName),
			)
			.then((rows) => rows[0]);

		return role;
	};
}

export default new RoleRep();
