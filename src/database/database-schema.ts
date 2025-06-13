import { serial, text, pgTable } from 'drizzle-orm/pg-core';
 
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  firstName: text('firstName'),
  lastName: text('lastName'),
  email: text('email'),
  status: text('status'),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  password: text('password'),
  email: text('email'),
});
 
export const databaseSchema = {
  students,
  users,
};