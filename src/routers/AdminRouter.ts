import type { Context } from 'hono';
import { Hono } from 'hono';
import adminController from '../controllers/AdminController.ts';
import { adminValidation, authenticate } from '../middlewares/Authentication.ts';

export const adminRouter = new Hono();

adminRouter.get('/healthy', (c: Context) => {
	return c.text('healthy', 200);
});

adminRouter.get('/get', authenticate, adminValidation, adminController.getAdminByUserId);
adminRouter.patch('/edit', authenticate, adminValidation, adminController.editAdminByUserId);

adminRouter.get('/get-all-students', authenticate, adminValidation, adminController.getAllStudents);
adminRouter.post('/add-student', authenticate, adminValidation, adminController.addStudent);
adminRouter.patch('/edit-student/:id', authenticate, adminValidation, adminController.editStudent);
adminRouter.patch('/edit-students', authenticate, adminValidation, adminController.editStudents);

adminRouter.get('/get-all-teachers', authenticate, adminValidation, adminController.getAllTeachers);
adminRouter.post('/add-teacher', authenticate, adminValidation, adminController.addTeacher);
adminRouter.patch('/edit-teacher/:id', authenticate, adminValidation, adminController.editTeacher);

adminRouter.get('/get-all-disciplines', authenticate, adminValidation, adminController.getAllDisciplines);
adminRouter.get('/get-discipline/:id', authenticate, adminValidation, adminController.getDisciplineById);
adminRouter.post('/add-discipline', authenticate, adminValidation, adminController.addDiscipline);
adminRouter.delete('/delete-discipline/:id', authenticate, adminValidation, adminController.deleteDiscipline);
adminRouter.patch(
	'/release-teacher-from-discipline',
	authenticate,
	adminValidation,
	adminController.releaseTeacherFromDiscipline,
);

adminRouter.patch('/lock-discipline-selection', authenticate, adminValidation, adminController.lockDisciplineSelection);
adminRouter.patch(
	'/unlock-discipline-selection',
	authenticate,
	adminValidation,
	adminController.unlockDisciplineSelection,
);
adminRouter.get(
	'/get-students-for-all-disciplines',
	authenticate,
	adminValidation,
	adminController.getStudentsForAllDisciplines,
);

adminRouter.patch(
	'/recalculate-students-credits',
	authenticate,
	adminValidation,
	adminController.recalculateStudentsCredits,
);
