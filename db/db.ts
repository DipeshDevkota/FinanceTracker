import { Client } from 'pg';

const client = new Client({
    host:'localhost',
    user:'postgres',
    port: 5433,
    password:"lolbro78",
    database:"postgres"
})


client.connect()
.then(()=> console.log("Connected to database"))
.catch((err)=> console.log(err));