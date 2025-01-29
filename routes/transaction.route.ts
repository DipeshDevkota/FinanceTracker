import express from 'express';
import { authUser } from '../middlewares/AuthUser';
import {addTransaction} from '../controllers/transaction.controller'

export const transactionRouter = express.Router();



transactionRouter.post('/transactionCreate',authUser,addTransaction)
transactionRouter.post('/transactionCategory',authUser,addTransaction)
