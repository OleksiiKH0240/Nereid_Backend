import type { SQL } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db } from '../databaseConnection.ts';
import { students } from '../schemas/students.ts';
import { users } from '../schemas/users.ts';

const filtersMap = {
	studentId: students.id,
	email: users.email,
	firstName: users.firstName,
	lastName: users.lastName,
	patronymic: users.patronymic,
	educationalProgram: students.educationalProgram,
	course: students.course,
	year: students.year,
	isActive: students.isActive,
	canSelect: students.canSelect,
};

export class StudentRep {
	private db: NodePgDatabase;
	constructor(dbClient = db) {
		this.db = dbClient;
	}

	getStudentById = async (studentId: number) => {
		const student = await this.db
			.select({
				id: students.id,
				userId: users.id,
				isActive: students.isActive,
			})
			.from(students)
			.innerJoin(users, eq(students.userId, users.id))
			.where(eq(students.id, studentId))
			.then((rows) => rows[0]);

		return student;
	};

	getStudentByUserId = async (userId: number) => {
		const student = await this.db
			.select({
				id: students.id,
				userId: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				educationalProgram: students.educationalProgram,
				course: students.course,
				year: students.year,
				isActive: students.isActive,
				canSelect: students.canSelect,
				semester1MinCredits: students.semester1MinCredits,
				semester1MaxCredits: students.semester1MaxCredits,
				semester1Credits: students.semester1Credits,
				semester2MinCredits: students.semester2MinCredits,
				semester2MaxCredits: students.semester2MaxCredits,
				semester2Credits: students.semester2Credits,
			})
			.from(students)
			.innerJoin(users, eq(students.userId, users.id))
			.where(eq(users.id, userId))
			.then((rows) => rows[0]);

		return student;
	};

	getAllStudents = async (filters?: {
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
		educationalProgram?: string;
		course?: string;
		year?: string;
		isActive?: boolean;
		canSelect?: boolean;
	}) => {
		const query = this.db
			.select({
				id: students.id,
				userId: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				patronymic: users.patronymic,
				email: users.email,
				educationalProgram: students.educationalProgram,
				course: students.course,
				year: students.year,
				isActive: students.isActive,
				canSelect: students.canSelect,
				semester1MinCredits: students.semester1MinCredits,
				semester1MaxCredits: students.semester1MaxCredits,
				semester1Credits: students.semester1Credits,
				semester2MinCredits: students.semester2MinCredits,
				semester2MaxCredits: students.semester2MaxCredits,
				semester2Credits: students.semester2Credits,
			})
			.from(students)
			.innerJoin(users, eq(students.userId, users.id));

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

	addStudent = async (student: {
		userId: number;
		educationalProgram: string;
		course: string;
		year: string;
	}) => {
		await this.db
			.insert(students)
			.values(
				{
					userId: student.userId,
					educationalProgram: student.educationalProgram,
					course: student.course,
					year: student.year,
				},
			);
	};

	editStudentById = async (studentId: number, student: Partial<typeof students.$inferSelect>) => {
		const isAnyFieldDefined = Object.values(student).some((value) => value !== undefined);

		if (isAnyFieldDefined === false) {
			return;
		}

		await this.db
			.update(students)
			.set(student)
			.where(eq(students.id, studentId));
	};

	editStudentBy = async (filters: {
		studentId?: number;
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
		educationalProgram?: string;
		course?: string;
		year?: string;
		isActive?: boolean;
		canSelect?: boolean;
	}, student: Partial<typeof students.$inferSelect>) => {
		if (Object.keys(filters).length === 0) return;

		const isAnyFieldDefined = Object.values(student).some((value) => value !== undefined);

		if (isAnyFieldDefined === false) {
			return;
		}

		const updateQuery = this.db.update(students).set(student);

		const eqList: SQL<unknown>[] = [];
		for (const [filterName, filterValue] of Object.entries(filters ?? {})) {
			const drizzleColumn = filtersMap[filterName as keyof typeof filtersMap];
			if (drizzleColumn !== undefined && filterValue !== undefined) {
				eqList.push(eq(drizzleColumn, filterValue));
			}
		}

		updateQuery.where(and(...eqList));
		await updateQuery;

		return;
	};
}

export default new StudentRep();
