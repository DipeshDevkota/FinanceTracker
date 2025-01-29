const express = require('express');
const app = express();
import cookieParser from 'cookie-parser';
import {userRouter} from './routes/user.routes'
import {transactionRouter} from './routes/transaction.route'
const bodyParser= require('body-parser');

require('dotenv').config();
app.use(bodyParser.json());
app.use(cookieParser())

app.use('/',userRouter);
app.use('/',transactionRouter);
app.get('/',(req:any,res:any)=>{
 res.send('Hello World');
});



app.listen(3004,()=>{
    console.log('Sever is running on port 3004');

})



