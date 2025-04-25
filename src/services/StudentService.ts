import studentDisciplineRelationRep from '~/database/repositories/studentDisciplineRelationRep.ts';
import teacherRep from '~/database/repositories/TeacherRep.ts';
import disciplineRep from '../database/repositories/DisciplineRep.ts';
import studentRep from '../database/repositories/StudentRep.ts';

export class StudentService {
	getStudentByUserId = async (userId: number) => {
		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		return {
			studentExists: true,
			student,
		};
	};

	getAllDisciplines = async (userId: number, semester: '1' | '2') => {
		if (!['1', '2'].includes(semester)) {
			return { invalidSemester: true };
		}

		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		if (student.isActive === false) {
			return { studentIsActive: false };
		}

		const disciplines = await disciplineRep.getAllDisciplinesBySemester(semester);
		const activeDisciplines = disciplines.filter((discipline) => discipline.isActive === true);

		return {
			invalidSemester: false,
			studentExists: true,
			studentIsActive: true,
			disciplines: activeDisciplines,
			minimumCredits: semester === '1' ? student.semester1MinCredits : student.semester2MinCredits,
			maximumCredits: semester === '1' ? student.semester1MaxCredits : student.semester2MaxCredits,
			currentCredits: semester === '1' ? student.semester1Credits : student.semester2Credits,
		};
	};

	getAllSelectedDisciplines = async (userId: number, semester: '1' | '2') => {
		if (!['1', '2'].includes(semester)) {
			return { selectedDisciplines: [], invalidSemester: true };
		}

		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { selectedDisciplines: [], studentExists: false };
		}

		if (student.isActive === false) {
			return { selectedDisciplines: [], studentIsActive: false };
		}

		const selectedDisciplines = await disciplineRep.getAllSelectedDisciplinesForStudent({
			semester,
			studentId: student.id,
		});

		// helper for situation when student selects multiple disciplines
		const currentCredits = selectedDisciplines.reduce((acc, discipline) => {
			return acc + discipline.credits;
		}, 0);

		const fieldsToChange = semester === '1'
			? { semester1Credits: currentCredits }
			: { semester2Credits: currentCredits };
		await studentRep.editStudentById(student.id, fieldsToChange);

		return {
			studentExists: true,
			studentIsActive: true,
			invalidSemester: false,
			selectedDisciplines,
			minimumCredits: semester === '1' ? student.semester1MinCredits : student.semester2MinCredits,
			maximumCredits: semester === '1' ? student.semester1MaxCredits : student.semester2MaxCredits,
			currentCredits,
		};
	};

	getDisciplineById = async (userId: number, disciplineId: number) => {
		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		if (student.isActive === false) {
			return { studentIsActive: false };
		}

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
			studentExists: true,
			disciplineExists: true,
			studentIsActive: true,
			discipline,
			disciplineFields,
			disciplineTeachers,
		};
	};

	getTeacherById = async (userId: number, teacherId: number) => {
		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		if (student.isActive === false) {
			return { studentIsActive: false };
		}

		const teacher = await teacherRep.getFullTeacherById(teacherId);
		if (teacher === undefined) {
			return { teacherExists: false };
		}

		const teacherFields = await teacherRep.getAllTeacherFields(teacherId);

		return {
			studentExists: true,
			studentIsActive: true,
			teacherExists: true,
			teacher,
			teacherFields,
		};
	};

	selectDiscipline = async (userId: number, disciplineIds: number[], semester: '1' | '2') => {
		if (!['1', '2'].includes(semester)) {
			return { invalidSemester: true };
		}

		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		if (student.isActive === false) {
			return { studentIsActive: false };
		}

		if (student.canSelect === false) {
			return { studentCanSelect: false };
		}

		const studentMaxCredits = semester === '1' ? student.semester1MaxCredits : student.semester2MaxCredits;
		const studentCurrentCredits = semester === '1' ? student.semester1Credits : student.semester2Credits;

		const promises = disciplineIds.map(async (disciplineId) => await disciplineRep.getDisciplineById(disciplineId));
		const allDisciplines = await Promise.all(promises);

		let filteredDisciplines = allDisciplines.filter((discipline) => discipline !== undefined);
		if (filteredDisciplines.length !== disciplineIds.length) {
			return { disciplineExists: false };
		}

		filteredDisciplines = filteredDisciplines.filter((discipline) => discipline.semester === semester);
		if (filteredDisciplines.length !== disciplineIds.length) {
			return { wrongSemester: true };
		}

		const creditsToAdd = filteredDisciplines.reduce((acc, discipline) => acc + discipline.credits, 0);
		if (
			studentCurrentCredits + creditsToAdd > studentMaxCredits
		) {
			return { exceededCreditsMax: true };
		}

		const promises_ = filteredDisciplines.map(async (discipline) =>
			await studentDisciplineRelationRep.addDisciplineToStudent(student.id, discipline.id)
		);
		await Promise.all(promises_);

		semester === '1'
			? await studentRep.editStudentById(student.id, { semester1Credits: studentCurrentCredits + creditsToAdd })
			// discipline.semester === '2'
			: await studentRep.editStudentById(student.id, { semester2Credits: studentCurrentCredits + creditsToAdd });

		return {
			studentExists: true,
			studentIsActive: true,
			studentCanSelect: true,
			disciplineExists: true,
			wrongSemester: false,
			exceededCreditsMax: false,
			currentCredits: studentCurrentCredits + creditsToAdd,
		};
	};

	deselectDiscipline = async (userId: number, disciplineIds: number[], semester: '1' | '2') => {
		if (!['1', '2'].includes(semester)) {
			return { invalidSemester: true };
		}

		const student = await studentRep.getStudentByUserId(userId);
		if (student === undefined) {
			return { studentExists: false };
		}

		if (student.isActive === false) {
			return { studentIsActive: false };
		}

		if (student.canSelect === false) {
			return { studentCanSelect: false };
		}

		const promises = disciplineIds.map(async (disciplineId) => await disciplineRep.getDisciplineById(disciplineId));
		const allDisciplines = await Promise.all(promises);
		const filteredDisciplines = allDisciplines.filter((discipline) => discipline !== undefined);

		const studentCurrentCredits = semester === '1' ? student.semester1Credits : student.semester2Credits;

		const promises_ = filteredDisciplines.map(async (discipline) =>
			await studentDisciplineRelationRep.deleteDisciplineFromStudent(student.id, discipline.id)
		);
		await Promise.all(promises_);

		const creditsToRemove = filteredDisciplines.reduce((acc, discipline) => acc + discipline.credits, 0);

		let studentUpdatedCredits = studentCurrentCredits - creditsToRemove;
		if (studentUpdatedCredits < 0) {
			console.warn(
				`Student with studentId ${student.id} and userId: (${student.userId})`
					+ `has negative credits(${studentUpdatedCredits}) after deselecting disciplines.`
					+ `\nCredits was set to zero.`,
			);
		}
		studentUpdatedCredits = studentUpdatedCredits < 0 ? 0 : studentUpdatedCredits;
		semester === '1'
			? await studentRep.editStudentById(student.id, { semester1Credits: studentUpdatedCredits })
			// discipline.semester === '2'
			: await studentRep.editStudentById(student.id, { semester2Credits: studentUpdatedCredits });

		return {
			studentExists: true,
			studentIsActive: true,
			studentCanSelect: true,
			disciplineExists: true,
			currentCredits: studentCurrentCredits - creditsToRemove,
		};
	};
}
export default new StudentService();
