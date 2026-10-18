import User from "../models/userModel.js";
import validator from 'validator';
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET=process.env.JWT_SECRET;
const Token_EXPIRES='24h'
 
const createToken=(userId)=>{
   return jwt.sign({id:userId},JWT_SECRET,{expiresIn:Token_EXPIRES})
}

//Register A User

export async function registerUser(req,res) {
    const {name,email,password}=req.body;
    if(!name||!email||!password){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        })

    }

    if(!validator.isEmail(email)){
        return res.status(400).json({
            success:false,
            message:"Invalid email"
        })
    }
    if(password.length<8){
        return res.status(400).json({
            success:false,
            message:"password must be atleast of 8 Character"
        })
    }
    try{
        if(await User.findOne({email})){
            return res.status(409).json({
                success:false,
                message:"User already paresent"
            })
        }

        const hashed=await bcrypt.hash(password,10)
        const user=await User.create({name,email,password:hashed})
        const token=createToken(user._id)
       
        res.status(201).json({
            success:true,
            token,
            user:{id:user._id,name:user.name,email:user.email}
        })

    }
    catch(err){
     console.error(err)
     res.status(500).json({
        success:false,
        message:"server error"
     })
    }
}

//user login

export async function login(req,res){
    const{email,password}=req.body;
    if(!email||!password){
        return res.status(400).json({
            success:false,
            message:"Both fields are required"
        })
    }
    try{
      const user=await User.findOne({email});
      if(!user){
        return res.status(401).json({
            success:false,
            message:"Invalid email or password"
        })
      }
      const match=await bcrypt.compare(password,user.password)
      if(!match){
         return res.status(500).json({
          success:false,
          message:"Invalid email or password"
     })
        
    }
    const token=createToken(user._id)
    res.json({
        success:true,
        token,
        user:{
            id:user._id,
            name:user.name,
            email:user.email
        }
    })
      
    }catch(err){
     console.error(err)
      res.status(500).json({
        success:false,
        message:"server error"
     })
    }
}

//to get login userDetails

export async function getCurrentUser(req,res) {
     try{
        const user=await User.findById(req.user.id).select("name email")
        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }
        res.json({success:true,user})
     }
     catch(err){
        console.error(err)
      res.status(500).json({
        success:false,
        message:"server error"
     })
     }
}


//update userProfile

export async function updateProfile(req,res) {
    const {name,email}=req.body;
    if(!name||!email||!validator.isEmail(email)){
        return res.status(400).json({
            success:false,
            message:"valid email and name are required"
        })
    }
    try{
   const exists=await User.findOne({email,_id:{$ne:req.user.id}});
   if(exists){
    return res.status(409).json({
        success:false,
        message:"Email already in use"
    })
   }
   const user=await User.findByIdAndUpdate(req.user.id,{name,email},
    {new:true,runValidators:true,select:"name email"}
   )
   res.json({
    success:true,
    user
   })
    }
    catch(err){
      console.error(err)
      res.status(500).json({
        success:false,
        message:"server error"
     })
    }
}

//to change password
export async function updatePassword(req,res) {
    const{currentPassword,newPassword}=req.body;
    if(!currentPassword||!newPassword||newPassword.length<8){
        return res.status(400).json({
             success:false,
            message:"Passowrd invalid or too short."
        });
    }
    try{
      const user=await User.findById(req.user.id).select("password");
      if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found"
        })
      }
      const match=await bcrypt.compare(currentPassword,user.password)
      if(!match){
        return res.status(401).json({
            success:false,
            message:"Current password is incorrect"
        })
      }
      user.password=await bcrypt.hash(newPassword,10)
      await user.save()
      res.json({
        success:true,
        message:"password changed"
      })
    }catch(err){
      console.error(err)
      res.status(500).json({
        success:false,
        message:"server error"  
    })
    }
}