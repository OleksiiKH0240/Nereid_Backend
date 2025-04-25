import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { disciplineFields } from '../schemas/disciplineFields.ts';
import { disciplines } from '../schemas/disciplines.ts';
import { studentDiscipleRelations } from '../schemas/studentDisciplineRelations.ts';
import { teacherDiscipleRelations } from '../schemas/teacherDisciplineRelations.ts';
import { teachers } from '../schemas/teachers.ts';
import { users } from '../schemas/users.ts';

export class DisciplineRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getAllDisciplines = async () => {
		const allDisciplines = await this.db.select().from(disciplines);
		return allDisciplines;
	};

	getAllDisciplinesByTeacherId = async (teacherId: number) => {
		const allDisciplines = await this.db
			.select({
				id: disciplines.id,
				name: disciplines.name,
				credits: disciplines.credits,
				semester: disciplines.semester,
				description: disciplines.description,
			})
			.from(disciplines)
			.innerJoin(teacherDiscipleRelations, eq(disciplines.id, teacherDiscipleRelations.disciplineId))
			.where(eq(teacherDiscipleRelations.teacherId, teacherId));
		return allDisciplines;
	};

	getAllDisciplinesBySemester = async (semester: '1' | '2') => {
		const allDisciplines = await this.db
			.select()
			.from(disciplines)
			.where(
				eq(disciplines.semester, semester),
			);

		return allDisciplines;
	};

	getAllSelectedDisciplinesForStudent = async (filters: { semester: '1' | '2'; studentId: number }) => {
		const allDisciplines = await this.db
			.select({
				id: disciplines.id,
				name: disciplines.name,
				credits: disciplines.credits,
			})
			.from(disciplines)
			.innerJoin(studentDiscipleRelations, eq(disciplines.id, studentDiscipleRelations.disciplineId))
			.where(and(
				eq(disciplines.semester, filters.semester),
				eq(studentDiscipleRelations.studentId, filters.studentId),
			));

		return allDisciplines;
	};

	getDisciplineById = async (disciplineId: number) => {
		const discipline = await this.db
			.select()
			.from(disciplines)
			.where(eq(disciplines.id, disciplineId))
			.then((rows) => rows[0]);

		return discipline;
	};

	editDisciplineById = async (disciplineId: number, discipline: {
		name?: string;
		description?: string;
		semester?: '1' | '2';
		credits?: number;
		isActive?: boolean;
	}) => {
		await this.db
			.update(disciplines)
			.set(discipline)
			.where(eq(disciplines.id, disciplineId));
	};

	getAllDisciplineFields = async (disciplineId: number) => {
		const allDisciplineFields = await this.db
			.select({
				id: disciplineFields.id,
				name: disciplineFields.name,
				content: disciplineFields.content,
			})
			.from(disciplines)
			.innerJoin(disciplineFields, eq(disciplines.id, disciplineFields.disciplineId))
			.where(eq(disciplines.id, disciplineId));

		return allDisciplineFields;
	};

	getAllDisciplineTeachers = async (disciplineId: number) => {
		const allDisciplineTeachers = await this.db
			.select({
				id: teachers.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
			})
			.from(disciplines)
			.innerJoin(teacherDiscipleRelations, eq(disciplines.id, teacherDiscipleRelations.disciplineId))
			.innerJoin(teachers, eq(teacherDiscipleRelations.teacherId, teachers.id))
			.innerJoin(users, eq(teachers.userId, users.id))
			.where(eq(disciplines.id, disciplineId));

		return allDisciplineTeachers;
	};

	addDiscipline = async (discipline: { name: string; semester: '1' | '2'; credits: number }) => {
		await this.db.insert(disciplines).values(discipline);
	};

	deleteDiscipline = async (disciplineId: number) => {
		await this.db
			.delete(disciplineFields)
			.where(
				eq(disciplineFields.disciplineId, disciplineId),
			);

		await this.db
			.delete(disciplines)
			.where(
				eq(disciplines.id, disciplineId),
			);
	};

	addFieldToDiscipline = async (disciplineId: number, field: {
		name: string;
		content: string;
	}) => {
		await this.db
			.insert(disciplineFields)
			.values({
				disciplineId,
				name: field.name,
				content: field.content,
			});
	};

	deleteFieldFromDiscipline = async (fieldId: number) => {
		await this.db
			.delete(disciplineFields)
			.where(eq(disciplineFields.id, fieldId));
	};
}

export default new DisciplineRep();
