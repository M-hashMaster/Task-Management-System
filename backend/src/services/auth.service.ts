import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { config } from '../config/env';
import { AppError } from '../utils/appError';
import { RegisterInput, LoginInput } from '../validations/auth.validation';

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: UserResponse;
  token: string;
}

export class AuthService {
  private formatUser(user: IUser): UserResponse {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  public async register(data: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 400);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword
    });

    const token = this.generateToken(user._id.toString(), user.email);

    return {
      user: this.formatUser(user),
      token
    };
  }

  public async login(data: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: data.email });
    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user._id.toString(), user.email);

    return {
      user: this.formatUser(user),
      token
    };
  }
}

export const authService = new AuthService();
