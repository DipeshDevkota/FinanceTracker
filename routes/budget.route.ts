import express from 'express';
import { authUser } from '../middlewares/AuthUser';

import {budgetAllocation,budgetAddition,viewBudgetById,viewBudget,budgetHistory,budgetRemaining,budgetInsight,createBudget} from '../controllers/budget.controller'
export const budgetRouter = express.Router();

budgetRouter.post('/budgetAllocate',authUser,budgetAllocation)
budgetRouter.post('/budgetAddition/:id',authUser,budgetAddition)
budgetRouter.post('/viewBudget',authUser,viewBudget)
budgetRouter.post('/viewBudgetById/:id',authUser,viewBudgetById)
budgetRouter.get('/budgetHistory/:id',authUser,budgetHistory)
budgetRouter.get('/budgetRemaining/:id',authUser,budgetRemaining)
budgetRouter.get('/budgetInsight',authUser,budgetInsight)
budgetRouter.get('/createBudget',authUser,createBudget)





