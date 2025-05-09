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
adminRouter.post('/add-students-with-csv', authenticate, adminValidation, adminController.addStudentsWithCsv);
adminRouter.get('/get-students-csv-template', authenticate, adminValidation, adminController.getStudentsCsvTemplate);

adminRouter.get('/get-all-teachers', authenticate, adminValidation, adminController.getAllTeachers);
adminRouter.post('/add-teacher', authenticate, adminValidation, adminController.addTeacher);
adminRouter.patch('/edit-teacher/:id', authenticate, adminValidation, adminController.editTeacher);
adminRouter.patch('/edit-teachers', authenticate, adminValidation, adminController.editTeachers);

adminRouter.get('/get-all-disciplines', authenticate, adminValidation, adminController.getAllDisciplines);
adminRouter.get('/get-discipline/:id', authenticate, adminValidation, adminController.getDisciplineById);
adminRouter.patch('edit-disciplines', authenticate, adminValidation, adminController.editDisciplines);
adminRouter.post('/add-discipline', authenticate, adminValidation, adminController.addDiscipline);
adminRouter.delete('/delete-discipline/:id', authenticate, adminValidation, adminController.deleteDiscipline);
adminRouter.patch(
	'/release-teacher-from-discipline',
	authenticate,
	adminValidation,
	adminController.releaseTeacherFromDiscipline,
);

adminRouter.get(
	'/get-discipline-selection-state',
	authenticate,
	adminValidation,
	adminController.getDisciplineSelectionState,
);
adminRouter.patch('/lock-discipline-selection', authenticate, adminValidation, adminController.lockDisciplineSelection);
adminRouter.patch(
	'/unlock-discipline-selection',
	authenticate,
	adminValidation,
	adminController.unlockDisciplineSelection,
);

// reports
adminRouter.get(
	'/get-students-for-all-disciplines',
	authenticate,
	adminValidation,
	adminController.getStudentsForAllDisciplines,
);
adminRouter.get(
	'/get-disciplines-for-all-students',
	authenticate,
	adminValidation,
	adminController.getDisciplinesForAllStudents,
);

adminRouter.patch(
	'/recalculate-students-credits',
	authenticate,
	adminValidation,
	adminController.recalculateStudentsCredits,
);

// adminRouter.patch('/reset-students-selection', authenticate, adminValidation, adminController.resetStudentsSelection);
