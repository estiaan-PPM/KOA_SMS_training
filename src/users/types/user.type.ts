export interface User {
  id: number;
  email: string;
  name: string;
  password?: string; // Optional for responses, required for auth
  isRegisteredWithGoogle?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}