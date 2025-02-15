import { index, integer, pgTable } from 'drizzle-orm/pg-core';
import { disciplines } from './disciplines.ts';
import { teachers } from './teachers.ts';

export const teacherDiscipleRelations = pgTable('teacher_discipline_relations', {
	teacherId: integer().references(() => teachers.id),
	disciplineId: integer().references(() => disciplines.id),
}, (table) => ({
	teacherDiscipleRelationsTeacherIdIdx: index().on(table.teacherId),
	teacherDiscipleRelationsDisciplineIdIdx: index().on(table.disciplineId),
}));
