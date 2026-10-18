import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dateFilter.js";
import XLSX from "xlsx"

// add expense

export async function addExpense(req,res) {
    const userId=req.user._id;
   const {description,amount,category,date}=req.body;
  
   try{
    if(!description||!amount||!category,!date){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        })
    }
     const newExpense=new expenseModel({
            userId,
            description,
            amount,
            category, 
            date:new Date(date)
        });
        await newExpense.save()
        res.json({
            success:true,
            message:"expense added successfully"
        })
  }
  catch(err){
    console.error(err)
    res.status(500).json({
        success:false,
        message:"Server error"
    })
  }
}

// to all expense

export async function getAllExpense(req,res) {
   const userId=req.user._id;

   try{
    const expense=await expenseModel.find({userId}).sort({date:-1})
    res.json(expense);
   }
   catch(err){
   console.error(err)
    res.status(500).json({
        success:false,
        message:"Server error"
    })
   }

}

//update expense

export async function updateExpense(req,res) {
    const{id}=req.params;
     const userId=req.user._id;
     const{description,amount}=req.body;

     try{
       const updatedExpense=await expenseModel.findByIdAndUpdate(
        {_id:id,userId},
        {description,amount},
        {new:true})

        if(!updatedExpense){
            return res.status(404).json({
                success:false,
                message:"expense not found"
            })
        }
       res.json({success:true,message:"expense updated successfully.",date:updatedExpense})
     }
     catch(err){
         console.error(err)
         res.status(500).json({
        success:false,
        message:"Server error"
    })
     }
}


//deleted an expense

export async function deleteExpense(req,res) {
    try{
    const expense=await expenseModel.findOneAndDelete({_id:req.params.id})
    if(!expense){
         return res.status(404).json({
            success:false,
            message:"expense not found"
         })
    }
    return res.json({
        success:true,
        message:"expense deleted successfully"
    })

    }
    catch(err){
        console.error(err)
         res.status(500).json({
        success:false,
        message:"Server error"
    })
    }
}


// download excel for expense

export async function downloadExpenseExel(req,res) {
   const userId=req.user._id;
   try{
    const expense=await expenseModel.find({userId}).sort({date:-1})
    const plainData=expense.map((exp)=>({
        Description:exp.description,
        Amount:exp.amount,
        Category:exp.category,
        Date:new Date(exp.date).toLocaleDateString()

    }));
   
    const worksheet=XLSX.utils.json_to_sheet(plainData)
    const workbook=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook,worksheet,"expenseModel")
    XLSX.writeFile(workbook,"expense_details.xlsx")
    res.download("expense_details.xlsx")
   }
   catch(err){
     console.error(err)
    res.status(500).json({
        success:false,
        message:"Server error"
    })
   }
}

//get overview of expense

export async function getExpenseOverview(req,res) {
      try {
      const userId=req.user._id; 
      const{range='monthly'}=req.query;
      const{start,end}=getDateRange(range)

      const expense=await expenseModel.find({
        userId,
        date:{$gte:start, $lte:end},
      }).sort({date:-1})
      
      const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
       const averageExpense = expense.length > 0 ? totalExpense / expense.length : 0;
       const numberOfTransactions = expense.length;
       const recentTransactions = expense.slice(0,5);

       res.json({
        success:true,
        data:{
            totalExpense,
            averageExpense,
            numberOfTransactions,
            recentTransactions,
            range
        }
       })

    }
     catch (err) {
        console.error(err)
       res.status(500).json({
        success:false,
        message:"Server error"
    })
    }
}