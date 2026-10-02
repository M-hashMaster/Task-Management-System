import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/user.model';
import { AuthUserPayload } from '../types';

interface JwtPayloadWithUser {
  userId: string;
  email: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Token is missing'
      });
      return;
    }

    let decoded: JwtPayloadWithUser;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as JwtPayloadWithUser;
    } catch (jwtError) {
      if (jwtError instanceof TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again'
        });
        return;
      }
      if (jwtError instanceof JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: 'Invalid authentication token'
        });
        return;
      }
      res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
      return;
    }

    if (!decoded.userId) {
      res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
      return;
    }

    const user = await User.findById(decoded.userId).select('_id email');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists'
      });
      return;
    }

    const userPayload: AuthUserPayload = {
      userId: user._id.toString(),
      email: user.email
    };

    req.user = userPayload;
    next();
  } catch (error) {
    next(error);
  }
};
