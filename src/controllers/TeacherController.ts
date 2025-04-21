import type { Context } from 'hono';
import teacherService from '../services/TeacherService.ts';
import { jwtDataGetters } from '../utils.ts';

export class TeacherController {
	getTeacherByUserId = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);
		const { teacherExists, teacher, allTeacherFields } = await teacherService.getTeacherByUserId(userId);
		if (teacherExists === true) {
			return c.json(
				{
					teacher,
					allTeacherFields,
				},
				200,
			);
		}

		return c.json({ message: `teacher with userId: ${userId} does not exist.` }, 400);
	};

	editTeacherById = async (c: Context) => {
		const teacherId = Number(c.req.param('id'));
		if (Number.isNaN(teacherId)) {
			return c.json({ message: 'No teacherId was provided.' }, 400);
		}

		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { email, firstName, lastName, patronymic } = body;
		const { teacherExists, isActive } = await teacherService.editTeacherById({
			teacherId,
			email,
			firstName,
			lastName,
			patronymic,
		});

		if (teacherExists === false) {
			return c.json({ message: `teacher with id '${teacherId}' doesn't exist.` }, 400);
		}

		if (isActive === false) {
			return c.json({ message: `teacher with id '${teacherId}' is inactive.` }, 400);
		}

		return c.json({ message: 'teacher was edited successfully.' }, 200);
	};

	addFieldToTeacher = async (c: Context) => {
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { teacherId, fieldName: name, fieldContent: content } = body;
		const { isActive, teacherExists } = await teacherService.addFieldToTeacher(teacherId, { name, content });

		if (teacherExists === false) {
			return c.json({ message: `teacher with id '${teacherId}' doesn't exist.` }, 400);
		}

		if (isActive === false) {
			return c.json({ message: `teacher with id '${teacherId}' is inactive.` }, 400);
		}

		return c.json({ message: 'field was successfully added.' }, 200);
	};

	deleteFieldFromTeacher = async (c: Context) => {
		const fieldId = Number(c.req.param('fieldId'));
		if (Number.isNaN(fieldId)) {
			return c.json({ message: 'No fieldId was provided.' }, 400);
		}

		const { isActive, teacherExists, isExists, field } = await teacherService.deleteFieldFromTeacher(fieldId);

		if (isExists === false) {
			return c.json({ message: `field with id '${fieldId}' doesn't exist.` }, 400);
		}

		if (teacherExists === false) {
			return c.json({ message: `teacher with id '${field!.teacherId}' doesn't exist.` }, 400);
		}

		if (isActive === false) {
			return c.json({ message: `teacher with id '${field!.teacherId}' is inactive.` }, 400);
		}

		return c.json({ message: 'field was successfully deleted.' }, 200);
	};

	getAllDisciplines = async (c: Context) => {
		const allDisciplines = await teacherService.getAllDisciplines();
		return c.json(allDisciplines, 200);
	};

	getAllDisciplinesByTeacherId = async (c: Context) => {
		const teacherId = Number(c.req.param('teacherId'));
		if (Number.isNaN(teacherId)) {
			return c.json({ message: 'No teacherId was provided.' }, 400);
		}

		const allDisciplines = await teacherService.getAllTakenDisciplines(teacherId);
		return c.json(allDisciplines, 200);
	};

	getDisciplineById = async (c: Context) => {
		const disciplineId = Number(c.req.param('id'));
		if (Number.isNaN(disciplineId)) {
			return c.json({ message: 'No disciplineId was provided.' }, 400);
		}
		const {
			disciplineExists,
			discipline,
			disciplineFields,
			disciplineTeachers,
		} = await teacherService.getDisciplineById(
			disciplineId,
		);

		if (disciplineExists === false) {
			return c.json({ message: `discipline with id '${disciplineId}' doesn't exist.` }, 400);
		}

		return c.json({
			discipline,
			disciplineFields,
			disciplineTeachers,
		}, 200);
	};

	takeDiscipline = async (c: Context) => {
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { teacherId, disciplineId } = body;
		const { disciplineExists, teacherExists } = await teacherService.takeDiscipline(teacherId, disciplineId);

		if (teacherExists === false) {
			return c.json({ message: `teacher with id '${teacherId}' doesn't exist.` }, 400);
		}

		if (disciplineExists === false) {
			return c.json({ message: `discipline with id '${disciplineId}' doesn't exist.` }, 400);
		}

		return c.json({ message: 'success.' }, 200);
	};

	releaseDiscipline = async (c: Context) => {
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { teacherId, disciplineId } = body;
		const { disciplineExists, teacherExists } = await teacherService.releaseDiscipline(teacherId, disciplineId);

		if (teacherExists === false) {
			return c.json({ message: `teacher with id '${teacherId}' doesn't exist.` }, 400);
		}

		if (disciplineExists === false) {
			return c.json({ message: `discipline with id '${disciplineId}' doesn't exist.` }, 400);
		}

		return c.json({ message: 'success.' }, 200);
	};

	addFieldToDiscipline = async (c: Context) => {
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const { disciplineId, fieldName: name, fieldContent: content } = body;
		const { teacherExists, isTeacherActive } = await teacherService.addFieldToDiscipline(disciplineId, userId, {
			name,
			content,
		});

		if (teacherExists === false) {
			return c.json({ message: `teacher with userId '${userId}' doesn't exist.` }, 400);
		}

		if (isTeacherActive === false) {
			return c.json({ message: `teacher with userId '${userId}' is inactive.` }, 400);
		}

		return c.json({ message: 'field was successfully added.' }, 200);
	};

	deleteFieldFromDiscipline = async (c: Context) => {
		const fieldId = Number(c.req.param('fieldId'));
		if (Number.isNaN(fieldId)) {
			return c.json({ message: 'No fieldId was provided.' }, 400);
		}
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const { teacherExists, isTeacherActive } = await teacherService.deleteFieldFromDiscipline(fieldId, userId);

		if (teacherExists === false) {
			return c.json({ message: `teacher with userId '${userId}' doesn't exist.` }, 400);
		}

		if (isTeacherActive === false) {
			return c.json({ message: `teacher with userId '${userId}' is inactive.` }, 400);
		}

		return c.json({ message: 'field was successfully deleted.' }, 200);
	};

	editDisciplineById = async (c: Context) => {
		const disciplineId = Number(c.req.param('id'));
		if (Number.isNaN(disciplineId)) {
			return c.json({ message: 'No disciplineId was provided.' }, 400);
		}
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { name, description, semester, credits } = body;
		const { teacherExists, isTeacherActive, invalidSemester } = await teacherService.editDisciplineById(
			disciplineId,
			userId,
			{
				name,
				description,
				semester,
				credits,
			},
		);

		if (teacherExists === false) {
			return c.json({ message: `teacher with userId '${userId}' doesn't exist.` }, 400);
		}

		if (isTeacherActive === false) {
			return c.json({ message: `teacher with userId '${userId}' is inactive.` }, 400);
		}

		if (invalidSemester) {
			return c.json({ message: `Invalid semester. Semester should be '1' or '2'.` }, 400);
		}

		return c.json({ message: 'discipline was successfully edited.' }, 200);
	};
}

export default new TeacherController();
