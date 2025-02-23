const express = require('express');
const app = express();
import cookieParser from 'cookie-parser';
import {userRouter} from './routes/user.routes'
import {transactionRouter} from './routes/transaction.route'
import { budgetRouter } from './routes/budget.route';
import {predictSpend} from './routes/spending.route'
const bodyParser= require('body-parser');

require('dotenv').config();
app.use(bodyParser.json());
app.use(cookieParser())

app.use('/',userRouter);
app.use('/',transactionRouter);
app.use('/',budgetRouter);
app.use('/',predictSpend);
app.get('/',(req:any,res:any)=>{
 res.send('Hello World');
});



app.listen(4006,()=>{
    console.log('Sever is running on port 4006');

})



