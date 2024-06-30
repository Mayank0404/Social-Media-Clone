const jwt=require('jsonwebtoken')
const { SECRETKEY } = require('../keys')
const user = require('../models/user')
module.exports=(req,res,next) =>{
    const{authorization}=req.headers
    if(!authorization){
            return  res.status(401).json({error:"User Must Be Logged in"})
    }
    else{
        const token=authorization.replace("Bearer ","")
        jwt.verify(token,SECRETKEY,(err,payload)=>{
            if(err){
                return res.status(401).json({error:"You Must Be Logged In"})
            }else{
                
                   const {id}=payload 
                      user.findById(id)
                           .then(userData =>{
                            userData.password=undefined
                            req.user=userData
                            
                            next()
                           })              
            }
        })
    }
}