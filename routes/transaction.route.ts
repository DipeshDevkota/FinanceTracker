import express from 'express';
import { authUser } from '../middlewares/AuthUser';
import {addTransaction,categorizeTransaction,deleteTransaction,allTransactions} from '../controllers/transaction.controller'

export const transactionRouter = express.Router();



transactionRouter.post('/transactionCreate',authUser,addTransaction)
transactionRouter.post('/transactionCategory',authUser,categorizeTransaction)
transactionRouter.post('/transactionDelete',authUser,deleteTransaction)
transactionRouter.post('/allTransactions',authUser,allTransactions)


