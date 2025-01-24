const express = require('express');
const app = express();

app.get('/',(req:any,res:any)=>{
 res.send('Hello World');
});



app.listen(3000,()=>{
    console.log('Sever is running on port 3000');

})



