import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

export interface DecodedUser extends JwtPayload {
  email: string;
}

export interface RequestWithUser extends Request {
  decoded: DecodedUser;
}
