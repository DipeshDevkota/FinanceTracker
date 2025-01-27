import express from 'express';
import { registerUser, loginUser, logoutUser, updateUser } from '../controllers/auth.controller';
import {getAllUsers,getUserById} from '../controllers/user.controller'
import { authUser } from '../middlewares/AuthUser';

export const userRouter = express.Router();

userRouter.post('/register', registerUser); // Public route
userRouter.post('/login', loginUser);       // Public route
userRouter.post('/logout', authUser, logoutUser); // Protected route
userRouter.patch('/update', authUser, updateUser);  
userRouter.get('/allusers',authUser,getAllUsers);
userRouter.get('/singleuser/:userId',authUser,getUserById);

