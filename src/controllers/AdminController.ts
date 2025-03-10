import type { Context } from 'hono';
import adminService from '../services/AdminService.ts';
import { jwtDataGetters } from '../utils.ts';

export class AdminController {
	getAdminByUserId = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);
		const admin = await adminService.getAdminByUserId(userId);

		if (admin.userExists === false) {
			return c.json({ message: `admin with userId '${userId}' doesn't exist.` }, 401);
		}

		return c.json(admin, 200);
	};

	editAdminByUserId = async (c: Context) => {
		const token = c.req.header('authorization');
		const userId = jwtDataGetters.getUserId(token!);
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { email, firstName, lastName, patronymic } = body;
		await adminService.editAdminByUserId(userId, { email, firstName, lastName, patronymic });
		return c.text('OK', 200);
	};

	getAllStudents = async (c: Context) => {
		const body = await c.req.json().catch(() => ({})); // Prevent crash if JSON is empty
		const { email, firstName, lastName, patronymic, group, year, isActive } = body;

		const students = await adminService.getAllStudents({
			email,
			firstName,
			lastName,
			patronymic,
			group,
			year,
			isActive,
		});

		c.status(200);
		return c.json(students);
	};

	addStudent = async (c: Context) => {
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { email, firstName, lastName, patronymic, group, year } = body;
		await adminService.addStudent({ email, firstName, lastName, patronymic, group, year });
		return c.text('OK', 200);
	};

	editStudent = async (c: Context) => {
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { studentId, email, firstName, lastName, patronymic, group, year, isActive } = body;
		const { studentExists } = await adminService.editStudent({
			id: studentId,
			email,
			firstName,
			lastName,
			patronymic,
			group,
			year,
			isActive,
		});

		if (studentExists === false) {
			return c.json({ message: `student with id '${studentId}' doesn't exist.` }, 401);
		}

		return c.json({ message: 'student was edited successfully.' }, 200);
	};

	getAllTeachers = async (c: Context) => {
		const body = await c.req.json().catch(() => ({})); // Prevent crash if JSON is empty
		const { email, firstName, lastName, patronymic, isActive } = body;

		const teachers = await adminService.getAllTeachers({
			email,
			firstName,
			lastName,
			patronymic,
			isActive,
		});
		return c.json(teachers, 200);
	};

	addTeacher = async (c: Context) => {
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { email, firstName, lastName, patronymic } = body;
		await adminService.addTeacher({ email, firstName, lastName, patronymic });
		return c.text('OK', 200);
	};

	editTeacher = async (c: Context) => {
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { teacherId, email, firstName, lastName, patronymic, isActive } = body;
		const { teacherExists } = await adminService.editTeacher({
			id: teacherId,
			email,
			firstName,
			lastName,
			patronymic,
			isActive,
		});

		if (teacherExists === false) {
			return c.json({ message: `teacher with id '${teacherId}' doesn't exist.` }, 401);
		}

		return c.json({ message: 'teacher was edited successfully.' }, 200);
	};

	getAllDisciplines = async (c: Context) => {
		const allDisciplines = await adminService.getAllDisciplines();
		return c.json(allDisciplines, 200);
	};

	getDisciplineById = async (c: Context) => {
		const disciplineId = Number(c.req.param('id'));
		const {
			disciplineExists,
			discipline,
			disciplineFields,
			disciplineTeachers,
		} = await adminService.getDisciplineById(
			disciplineId,
		);

		if (disciplineExists === false) {
			return c.json({ message: `discipline with id '${disciplineId}' doesn't exist.` }, 401);
		}

		return c.json({
			discipline,
			disciplineFields,
			disciplineTeachers,
		}, 200);
	};

	addDiscipline = async (c: Context) => {
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { disciplineName } = body;
		await adminService.addDiscipline(disciplineName);
		return c.text('OK', 200);
	};

	deleteDiscipline = async (c: Context) => {
		const disciplineId = Number(c.req.param('id'));

		await adminService.deleteDiscipline(disciplineId);
		return c.text('OK', 200);
	};

	releaseTeacherFromDiscipline = async (c: Context) => {
		const body = await c.req.json().catch(() => {}); // Prevent crash if JSON is empty
		if (body === undefined) {
			return c.json({ message: 'Empty request body' }, 400);
		}

		const { teacherId, disciplineId } = body;
		await adminService.releaseTeacherFromDiscipline(teacherId, disciplineId);
		return c.text('OK', 200);
	};
}

export default new AdminController();
