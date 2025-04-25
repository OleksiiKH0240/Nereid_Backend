import teacherDisciplineRelationRep from '~/database/repositories/teacherDisciplineRelationRep.ts';
import userRep from '~/database/repositories/UserRep.ts';
import disciplineRep from '../database/repositories/DisciplineRep.ts';
import teacherRep from '../database/repositories/TeacherRep.ts';

export class TeacherService {
	getTeacherByUserId = async (userId: number) => {
		const teacher = await teacherRep.getTeacherByUserId(userId);
		if (teacher === undefined) {
			return { teacherExists: false };
		}

		const allTeacherFields = await teacherRep.getAllTeacherFields(teacher.id);
		return {
			teacherExists: true,
			teacher,
			allTeacherFields,
		};
	};

	editTeacherById = async (teacher: {
		teacherId: number;
		email?: string;
		firstName?: string;
		lastName?: string;
		patronymic?: string;
	}) => {
		const currTeacher = await teacherRep.getTeacherById(teacher.teacherId);
		if (currTeacher === undefined) {
			return { teacherExists: false };
		}

		if (currTeacher.isActive === false) {
			return { isActive: false };
		}

		if (
			teacher.email !== undefined
			|| teacher.firstName !== undefined
			|| teacher.lastName !== undefined
			|| teacher.patronymic !== undefined
		) {
			await userRep.editUserById(currTeacher.userId, {
				email: teacher.email,
				firstName: teacher.firstName,
				lastName: teacher.lastName,
				patronymic: teacher.patronymic,
			});
		}

		return {
			teacherExists: true,
			isActive: true,
		};
	};

	addFieldToTeacher = async (
		teacherId: number,
		field: {
			name: string;
			content: string;
		},
	) => {
		const currTeacher = await teacherRep.getTeacherById(teacherId);
		if (currTeacher === undefined) {
			return { teacherExists: false };
		}

		// if (currTeacher.userId !== teacher.userId) {
		// 	return { isOwner: false };
		// }

		if (currTeacher.isActive === false) {
			return { isActive: false };
		}

		await teacherRep.addFieldToTeacher(teacherId, field);
		return {
			teacherExists: true,
			// isOwner: true,
			isActive: true,
		};
	};

	deleteFieldFromTeacher = async (fieldId: number) => {
		const field = await teacherRep.getFieldById(fieldId);

		if (field === undefined) return { isExists: false };

		const currTeacher = await teacherRep.getTeacherById(field.teacherId);
		if (currTeacher === undefined) {
			return { teacherExists: false };
		}

		if (currTeacher.isActive === false) {
			return { isActive: false };
		}

		await teacherRep.deleteFieldFromTeacher(fieldId);
		return { isExists: true, teacherExists: true, isActive: true, field };
	};

	getAllDisciplines = async () => {
		const allDisciplines = await disciplineRep.getAllDisciplines();
		const activeDisciplines = allDisciplines.filter((discipline) => discipline.isActive === true);

		return activeDisciplines;
	};

	getAllTakenDisciplines = async (teacherId: number) => {
		const allDisciplines = await disciplineRep.getAllDisciplinesByTeacherId(teacherId);
		return allDisciplines;
	};

	getDisciplineById = async (disciplineId: number) => {
		const discipline = await disciplineRep.getDisciplineById(disciplineId);
		if (discipline === undefined) {
			return { disciplineExists: false };
		}

		const disciplineFieldsPromise = disciplineRep.getAllDisciplineFields(disciplineId);
		const disciplineTeachersPromise = disciplineRep.getAllDisciplineTeachers(disciplineId);
		const [disciplineFields, disciplineTeachers] = await Promise.all([
			disciplineFieldsPromise,
			disciplineTeachersPromise,
		]);

		return {
			disciplineExists: true,
			discipline,
			disciplineFields,
			disciplineTeachers,
		};
	};

	editDisciplineById = async (disciplineId: number, teacherUserId: number, discipline: {
		name?: string;
		description?: string;
		semester?: '1' | '2';
		credits?: number;
	}) => {
		const currTeacher = await teacherRep.getTeacherByUserId(teacherUserId);
		if (currTeacher === undefined) {
			return { teacherExists: false };
		}

		if (currTeacher.isActive === false) {
			return { isTeacherActive: false };
		}

		if (discipline.semester !== undefined && !['1', '2'].includes(discipline.semester)) {
			return { invalidSemester: true };
		}

		await disciplineRep.editDisciplineById(disciplineId, discipline);

		return {
			teacherExists: true,
			isTeacherActive: true,
		};
	};

	takeDiscipline = async (teacherId: number, disciplineId: number) => {
		const teacher = await teacherRep.getTeacherById(teacherId);
		if (teacher === undefined) {
			return { teacherExists: false };
		}

		const discipline = await disciplineRep.getDisciplineById(disciplineId);
		if (discipline === undefined) {
			return { disciplineExists: false };
		}

		await teacherDisciplineRelationRep.addTeacherToDiscipline(teacherId, disciplineId);

		return { teacherExists: true, disciplineExists: true };
	};

	releaseDiscipline = async (teacherId: number, disciplineId: number) => {
		const teacher = await teacherRep.getTeacherById(teacherId);
		if (teacher === undefined) {
			return { teacherExists: false };
		}

		const discipline = await disciplineRep.getDisciplineById(disciplineId);
		if (discipline === undefined) {
			return { disciplineExists: false };
		}

		await teacherDisciplineRelationRep.deleteTeacherFromDiscipline(teacherId, disciplineId);

		return { teacherExists: true, disciplineExists: true };
	};

	addFieldToDiscipline = async (disciplineId: number, teacherUserId: number, field: {
		name: string;
		content: string;
	}) => {
		const currTeacher = await teacherRep.getTeacherByUserId(teacherUserId);
		if (currTeacher === undefined) {
			return { teacherExists: false };
		}

		if (currTeacher.isActive === false) {
			return { isTeacherActive: false };
		}

		await disciplineRep.addFieldToDiscipline(disciplineId, field);
		return {
			teacherExists: true,
			isTeacherActive: true,
		};
	};

	deleteFieldFromDiscipline = async (fieldId: number, teacherUserId: number) => {
		const currTeacher = await teacherRep.getTeacherByUserId(teacherUserId);
		if (currTeacher === undefined) {
			return { teacherExists: false };
		}

		if (currTeacher.isActive === false) {
			return { isTeacherActive: false };
		}

		await disciplineRep.deleteFieldFromDiscipline(fieldId);
		return { teacherExists: true, isTeacherActive: true };
	};
}

export default new TeacherService();
