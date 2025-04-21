import type { SQL } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { teacherFields } from '../schemas/teacherFields.ts';
import { teachers } from '../schemas/teachers.ts';
import { users } from '../schemas/users.ts';

const filtersMap = {
	email: users.email,
	firstName: users.firstName,
	lastName: users.lastName,
	patronymic: users.patronymic,
	isActive: teachers.isActive,
};

export class TeacherRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getFullTeacherById = async (teacherId: number) => {
		const teacher = await this.db
			.select({
				id: teachers.id,
				userId: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				isActive: teachers.isActive,
			})
			.from(teachers)
			.innerJoin(users, eq(teachers.userId, users.id))
			.where(eq(teachers.id, teacherId))
			.then((rows) => rows[0]);

		return teacher;
	};

	getTeacherById = async (teacherId: number) => {
		const teacher = await this.db
			.select({
				id: teachers.id,
				userId: teachers.userId,
				isActive: teachers.isActive,
			})
			.from(teachers)
			.where(eq(teachers.id, teacherId))
			.then((rows) => rows[0]);

		return teacher;
	};

	getTeacherByUserId = async (userId: number) => {
		const teacher = await this.db
			.select({
				id: teachers.id,
				userId: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				isActive: teachers.isActive,
			})
			.from(teachers)
			.innerJoin(users, eq(teachers.userId, users.id))
			.where(eq(users.id, userId))
			.then((rows) => rows[0]);

		return teacher;
	};

	getAllTeachers = async (filters?: {
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
		isActive?: boolean;
	}) => {
		const query = this.db
			.select({
				id: teachers.id,
				userId: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				isActive: teachers.isActive,
			})
			.from(teachers)
			.innerJoin(users, eq(teachers.userId, users.id));

		const eqList: SQL<unknown>[] = [];
		for (const [filterName, filterValue] of Object.entries(filters ?? {})) {
			const drizzleColumn = filtersMap[filterName as keyof typeof filtersMap];
			if (drizzleColumn !== undefined && filterValue !== undefined) {
				eqList.push(eq(drizzleColumn, filterValue));
			}
		}

		if (eqList.length !== 0) {
			return await query.where(and(...eqList));
		}

		return await query;
	};

	addTeacher = async (teacher: {
		userId: number;
	}) => {
		await this.db
			.insert(teachers)
			.values({
				userId: teacher.userId,
			});
	};

	editTeacherById = async (teacherId: number, teacher: {
		isActive?: boolean;
	}) => {
		const isAnyFieldDefined = Object.values(teacher).some((value) => value !== undefined);

		if (isAnyFieldDefined === false) {
			return;
		}

		await this.db
			.update(teachers)
			.set({
				isActive: teacher.isActive,
			})
			.where(eq(teachers.id, teacherId));
	};

	getAllTeacherFields = async (teacherId: number) => {
		const allTeacherFields = await this.db
			.select({
				id: teacherFields.id,
				teacherId: teacherFields.teacherId,
				name: teacherFields.name,
				content: teacherFields.content,
			})
			.from(teachers)
			.innerJoin(teacherFields, eq(teachers.id, teacherFields.teacherId))
			.where(eq(teachers.id, teacherId));

		return allTeacherFields;
	};

	getFieldById = async (fieldId: number) => {
		return await this.db.select().from(teacherFields).where(eq(teacherFields.id, fieldId)).then((rows) => rows[0]);
	};

	addFieldToTeacher = async (
		teacherId: number,
		field: {
			name: string;
			content: string;
		},
	) => {
		await this.db
			.insert(teacherFields)
			.values({
				teacherId: teacherId,
				name: field.name,
				content: field.content,
			});
	};

	deleteFieldFromTeacher = async (fieldId: number) => {
		await this.db
			.delete(teacherFields)
			.where(eq(teacherFields.id, fieldId));
	};
}

export default new TeacherRep();
