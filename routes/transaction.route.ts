import express from 'express';
import { authUser } from '../middlewares/AuthUser';
import {addTransaction,deleteTransaction,allTransactions,categorizeTransaction} from '../controllers/transaction.controller'

export const transactionRouter = express.Router();



transactionRouter.post('/transactionCreate/:budgetId',authUser,categorizeTransaction,addTransaction)
transactionRouter.post('/transactionDelete',authUser,deleteTransaction)
transactionRouter.post('/allTransactions',authUser,allTransactions)


