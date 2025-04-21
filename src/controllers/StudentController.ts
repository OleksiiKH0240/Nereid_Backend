import type { Context } from 'hono';
import studentService from '../services/StudentService.ts';
import { jwtDataGetters } from '../utils.ts';

export class StudentController {
	getStudentByUserId = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);
		const { studentExists, student } = await studentService.getStudentByUserId(userId);

		if (studentExists === false) {
			return c.json({ message: `student with userId: ${userId} does not exist.` }, 400);
		}

		return c.json(student, 200);
	};

	getAllDisciplines = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const semester = c.req.query('semester');
		if (semester === undefined) {
			return c.json({ message: 'semester is required' }, 400);
		}

		const {
			studentExists,
			disciplines,
			invalidSemester,
			studentIsActive,
			minimumCredits,
			maximumCredits,
			currentCredits,
		} = await studentService.getAllDisciplines(
			userId,
			semester as '1' | '2',
		);
		if (invalidSemester) {
			return c.json({ message: `Invalid semester. Semester should be '1' or '2'.` }, 400);
		}

		if (studentExists === false) {
			return c.json({ message: `student with userId: ${userId} does not exist.` }, 400);
		}

		if (studentIsActive === false) {
			return c.json({ message: `student with userId: ${userId} is not active.` }, 400);
		}

		return c.json({
			disciplines,
			minimumCredits,
			maximumCredits,
			currentCredits,
		}, 200);
	};

	getAllSelectedDisciplines = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const semester = c.req.query('semester');
		if (semester === undefined) {
			return c.json({ message: 'semester is required' }, 400);
		}

		const {
			studentExists,
			studentIsActive,
			invalidSemester,
			selectedDisciplines,
			minimumCredits,
			maximumCredits,
			currentCredits,
		} = await studentService
			.getAllSelectedDisciplines(
				userId,
				semester as '1' | '2',
			);

		if (invalidSemester) {
			return c.json({ message: `Invalid semester. Semester should be '1' or '2'.` }, 400);
		}

		if (studentExists === false) {
			return c.json({ message: `student with userId: ${userId} does not exist.` }, 400);
		}

		if (studentIsActive === false) {
			return c.json({ message: `student with userId: ${userId} is not active.` }, 400);
		}

		return c.json({
			selectedDisciplines,
			minimumCredits,
			maximumCredits,
			currentCredits,
		}, 200);
	};

	getDisciplineById = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const disciplineId = Number(c.req.param('id'));
		if (Number.isNaN(disciplineId)) {
			return c.json({ message: 'No disciplineId was provided.' }, 400);
		}

		const { studentExists, disciplineExists, studentIsActive, discipline, disciplineFields, disciplineTeachers } =
			await studentService.getDisciplineById(userId, disciplineId);

		if (studentExists === false) {
			return c.json({ message: `student with userId: ${userId} does not exist.` }, 400);
		}

		if (studentIsActive === false) {
			return c.json({ message: `student with userId: ${userId} is not active.` }, 400);
		}

		if (disciplineExists === false) {
			return c.json({ message: `discipline with id: ${disciplineId} does not exist.` }, 400);
		}

		return c.json({
			discipline,
			disciplineFields,
			disciplineTeachers,
		}, 200);
	};

	getTeacherById = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const teacherId = Number(c.req.param('id'));
		if (Number.isNaN(teacherId)) {
			return c.json({ message: 'No teacherId was provided.' }, 400);
		}

		const { studentExists, studentIsActive, teacherExists, teacher, teacherFields } = await studentService
			.getTeacherById(userId, teacherId);

		if (studentExists === false) {
			return c.json({ message: `student with userId: ${userId} does not exist.` }, 400);
		}

		if (studentIsActive === false) {
			return c.json({ message: `student with userId: ${userId} is not active.` }, 400);
		}

		if (teacherExists === false) {
			return c.json({ message: `teacher with id: ${teacherId} does not exist.` }, 400);
		}

		return c.json({
			teacher,
			teacherFields,
		}, 200);
	};

	selectDiscipline = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const disciplineIds = body.disciplineIds ?? [];

		const semester = c.req.query('semester');
		if (semester === undefined) {
			return c.json({ message: 'semester is required' }, 400);
		}

		const {
			invalidSemester,
			wrongSemester,
			studentExists,
			studentIsActive,
			studentCanSelect,
			disciplineExists,
			exceededCreditsMax,
			currentCredits,
		} = await studentService
			.selectDiscipline(
				userId,
				disciplineIds,
				semester as '1' | '2',
			);

		if (invalidSemester) {
			return c.json({ message: `Invalid semester. Semester should be '1' or '2'.` }, 400);
		}

		if (wrongSemester) {
			return c.json({
				message: `Incorrect semester: the semester in some disciplines differs from the one provided by the user.`,
			}, 400);
		}

		if (studentExists === false) {
			return c.json({ message: `student with userId: ${userId} does not exist.` }, 400);
		}

		if (studentIsActive === false) {
			return c.json({ message: `student with userId: ${userId} is not active.` }, 400);
		}

		if (studentCanSelect === false) {
			return c.json({ message: `student with userId: ${userId} cannot select disciplines.` }, 400);
		}

		if (disciplineExists === false) {
			return c.json({ message: `some disciplines do not exist.` }, 400);
		}

		if (exceededCreditsMax === true) {
			return c.json({ message: `student with userId: ${userId} has exceeded the maximum credits.` }, 400);
		}

		return c.json({ currentCredits }, 200);
	};

	deselectDiscipline = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);

		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const disciplineIds = body.disciplineIds ?? [];

		const semester = c.req.query('semester');
		if (semester === undefined) {
			return c.json({ message: 'semester is required' }, 400);
		}

		const { invalidSemester, studentExists, studentIsActive, studentCanSelect, disciplineExists, currentCredits } =
			await studentService
				.deselectDiscipline(
					userId,
					disciplineIds,
					semester as '1' | '2',
				);

		if (invalidSemester) {
			return c.json({ message: `Invalid semester. Semester should be '1' or '2'.` }, 400);
		}

		if (studentExists === false) {
			return c.json({ message: `student with userId: ${userId} does not exist.` }, 400);
		}

		if (studentIsActive === false) {
			return c.json({ message: `student with userId: ${userId} is not active.` }, 400);
		}

		if (studentCanSelect === false) {
			return c.json({ message: `student with userId: ${userId} cannot deselect disciplines.` }, 400);
		}

		if (disciplineExists === false) {
			return c.json({ message: `discipline with id: ${c.req.param('id')} does not exist.` }, 400);
		}

		return c.json({ currentCredits }, 200);
	};
}

export default new StudentController();
