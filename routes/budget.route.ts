import express from 'express';
import { authUser } from '../middlewares/AuthUser';

import {budgetAllocation} from '../controllers/budget.controller'
export const budgetRouter = express.Router();

budgetRouter.post('/budgetAllocate',authUser,budgetAllocation)
