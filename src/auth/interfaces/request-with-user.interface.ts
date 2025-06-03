import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
    userType: string;
    schoolId: number;
    relatedEntityId?: number;
  };
}