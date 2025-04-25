import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { teacherDiscipleRelations } from '../schemas/teacherDisciplineRelations.ts';

export class TeacherDisciplineRelationRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getTeachersByDiscipline = async (disciplineId: number) => {
		const disciplineTeachers = await this.db
			.select({
				id: teacherDiscipleRelations.teacherId,
			})
			.from(teacherDiscipleRelations)
			.where(eq(teacherDiscipleRelations.disciplineId, disciplineId));

		return disciplineTeachers;
	};

	addTeacherToDiscipline = async (teacherId: number, disciplineId: number) => {
		const result = await this.db
			.select()
			.from(teacherDiscipleRelations)
			.where(
				and(
					eq(teacherDiscipleRelations.teacherId, teacherId),
					eq(teacherDiscipleRelations.disciplineId, disciplineId),
				),
			)
			.then((rows) => rows[0]);

		if (result !== undefined) return;

		await this.db.insert(teacherDiscipleRelations).values({ teacherId, disciplineId });
	};

	deleteTeacherFromDiscipline = async (teacherId: number, disciplineId: number) => {
		await this.db
			.delete(teacherDiscipleRelations)
			.where(
				and(
					eq(teacherDiscipleRelations.teacherId, teacherId),
					eq(teacherDiscipleRelations.disciplineId, disciplineId),
				),
			);
	};
}

export default new TeacherDisciplineRelationRep();
