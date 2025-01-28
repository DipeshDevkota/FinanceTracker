import {Redis} from 'ioredis';
const redisClient= new Redis({
    host:'127.0.0.1',
    port:6379,
});

redisClient.on("connect",()=>{
    console.log("Connected to existing Redis server!")
});


redisClient.on("error",(err)=>{
    console.log(`Redis connection error : ${err.message}`)
});


export {redisClient};


