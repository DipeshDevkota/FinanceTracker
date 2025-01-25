import express from 'express';
import { registerUser, loginUser, logoutUser, updateUser } from '../controllers/auth.controller';
import { authUser } from '../middlewares/AuthUser';
import { Request, Response, NextFunction } from 'express';

export const userRouter = express.Router();

userRouter.post('/register', registerUser); // Public route
userRouter.post('/login', loginUser);       // Public route
userRouter.post('/logout', authUser, logoutUser); // Protected route
userRouter.put('/update', authUser, updateUser);  // Protected route
