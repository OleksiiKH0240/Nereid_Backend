import { boolean, integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const students = pgTable('students', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer().notNull().unique().references(() => users.id),
	year: varchar({ length: 255 }),
	educationalProgram: varchar({ length: 255 }).notNull(),
	course: varchar({ length: 255 }).notNull(),
	semester1MinCredits: integer().notNull().default(0),
	semester1MaxCredits: integer().notNull().default(0),
	semester1Credits: integer().notNull().default(0),
	semester2MinCredits: integer().notNull().default(0),
	semester2MaxCredits: integer().notNull().default(0),
	semester2Credits: integer().notNull().default(0),
	isActive: boolean().default(true),
	canSelect: boolean().default(false),
});
