const express = require('express');
const app = express();
import cookieParser from 'cookie-parser';
import {userRouter} from './routes/user.routes'
const bodyParser= require('body-parser');
app.use(bodyParser.json());
app.use(cookieParser())

app.use('/',userRouter);
app.get('/',(req:any,res:any)=>{
 res.send('Hello World');
});



app.listen(3000,()=>{
    console.log('Sever is running on port 3000');

})



