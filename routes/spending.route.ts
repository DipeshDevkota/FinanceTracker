import express from 'express';
import { authUser } from '../middlewares/AuthUser';

import {predictSpending} from '../controllers/spending.controller'
export const predictSpend= express.Router();


predictSpend.get('/predictSpend',authUser,predictSpending)






