import { NextFunction } from "express";

const {Request,Response,NextFunction}= require('express');


export const loginUser = async(
  req:Request,
  res:Response,
  next:NextFunction

)=>{
    try {

        const {email,password}= req.body;
        
        
    } catch (error) {
        
    }
}