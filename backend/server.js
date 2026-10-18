import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoutes.js';
import incomeRouter from './routes/incomeRoutes.js';
import expenseRouter from './routes/expenseRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';

 
const app=express()

const PORT=process.env.PORT||4000;

//MIDDlEWARE

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}))


//DB
connectDB()

//Routes
app.use('/api/user',userRouter)
app.use('/api/income',incomeRouter)
app.use('/api/expense',expenseRouter)
app.use('/api/dashboard',dashboardRouter)


//Route
app.get("/",(req,res)=>{
    res.send("Api done")
})

app.listen(PORT,()=>{
    console.log(`the Port is listen on  http://localhost:${PORT}`)
})