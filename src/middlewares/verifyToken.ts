import { Request, Response, NextFunction } from 'express';
import config from '../config/config';
import jwt from 'jsonwebtoken';

const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(
    token,
    config.accessTokenSecret as string,
    (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(401).send({ message: 'unauthorized access' });
      }

      // Attach decoded user to the request
      (req as any).decoded = decoded;
      next();
    },
  );
};


export default verifyToken;
