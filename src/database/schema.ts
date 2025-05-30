import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  password: text('password'),
  isRegisteredWithGoogle: boolean('is_registered_with_google').default(false),
  currentHashedRefreshToken: text('current_hashed_refresh_token'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Posts table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .references(() => users.id)
    .notNull(),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));