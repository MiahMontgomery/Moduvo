import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  
  return jwt.sign(payload, secret, { 
    expiresIn: '7d',
    issuer: 'moduvo-platform'
  });
}

export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  
  return jwt.verify(token, secret) as JWTPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies for browser-based auth
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }
  
  return null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'unauthenticated' });
    }

    const payload = verifyToken(token);
    const user = await storage.getUser(payload.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'user not found' });
    }

    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'invalid token' });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  
  if (!authReq.user) {
    return res.status(401).json({ error: 'unauthenticated' });
  }
  
  if (authReq.user.role !== 'admin') {
    return res.status(403).json({ error: 'insufficient privileges' });
  }
  
  next();
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (token) {
      const payload = verifyToken(token);
      const user = await storage.getUser(payload.userId);
      if (user) {
        (req as AuthenticatedRequest).user = payload;
      }
    }
  } catch (error) {
    // Ignore auth errors for optional auth
  }
  next();
}