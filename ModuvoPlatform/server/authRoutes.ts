import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { generateToken, hashPassword, comparePassword, requireAuth, type AuthenticatedRequest } from './auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const passwordResetSchema = z.object({
  email: z.string().email(),
});

export function setupAuthRoutes(app: Express) {
  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role as 'user' | 'admin',
      });

      // Set HTTP-only cookie for browser auth
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Register endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const passwordHash = await hashPassword(password);
      
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'customer',
        isActive: true,
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role as 'user' | 'admin',
      });

      // Set HTTP-only cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get current user
  app.get('/api/auth/user', requireAuth, async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await storage.getUser(authReq.user.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
  });

  // Password reset request (stub for now)
  app.post('/api/auth/password-reset', async (req: Request, res: Response) => {
    try {
      const { email } = passwordResetSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
      }

      // TODO: Implement password reset email sending
      console.log(`Password reset requested for: ${email}`);
      
      res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      console.error('Password reset error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}