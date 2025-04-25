import { boolean, integer, pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const semesterEnum = pgEnum('semester_enum', ['1', '2']);

export const disciplines = pgTable('disciplines', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	credits: integer().notNull(),
	semester: semesterEnum().notNull(),
	description: text(),
	isActive: boolean().default(true),
});
