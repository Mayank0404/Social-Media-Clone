const express=require("express")
const requireLogin = require("../middleware/requireLogin")
const Post = require("../models/post")
const router=express.Router()

//creating post
router.post("/createPost",requireLogin,(req,res)=>{
  const {title,body,pic}=req.body
  if(!title || !body || !pic){
         return res.status(422).json({error:"Please Add All Fields"})
  }else{
    const post =new Post({title,body,photo:pic,postedBy:req.user})
    post.save()
         .then(result => res.json(result))
  }
      
})

//showing alll post to user
router.get("/allpost",requireLogin,(req,res)=>{
    Post.find()
         .populate("postedBy","_id name")
         .then(posts => res.json(posts))
})

//showing post of user itself
router.get("/mypost",requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy"," _id name")
    .then(mypost =>{
        res.json(mypost)
    })
})

// liking up a post
router.put("/like",requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.pid,{
        $push:{likes:req.user._id}
    },{
        new:true
    })
    .then(result => res.json(result))
})

//dislike posts
router.put("/dislike",requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.pid,{
        $pull:{likes:req.user._id}
    },{
        new:true
    })
    .then(result => res.json(result))
})

//comment
router.put("/comment",requireLogin,(req,res)=>{
    const comment={
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment} 
    },{
        new:true
    })
    .populate("comments.postedBy","_id name email")
    .populate("postedBy","_id name")
    .exec((err,result)=>{ //replacement of then
        if(err){
            res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

//delete post
router.delete("/delete/:postId",requireLogin,(req,res)=>{
   Post.findOne({_id:req.params.postId})
        .populate("postedBy","_id name")
        .exec((err,post)=>{
            if(err){
                return res.status(422).json({error:err})
            }
            if(post.postedBy._id.toString() === req.user._id.toString()){
                post.remove()
                     .then(result =>{
                         return res.json(result)
                     })
            }
        })
})




module.exports=router