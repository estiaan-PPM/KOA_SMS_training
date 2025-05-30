import { Request } from 'express';
import { User } from '../../users/types/user.type';

export interface RequestWithUser extends Request {
  user: User;
}