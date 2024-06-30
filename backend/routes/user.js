const express=require('express')
const requireLogin = require('../middleware/requireLogin')
const Post = require('../models/post')
const User = require('../models/user')
const router=express.Router()

//showing profile of user
router.get('/user/:id',requireLogin,(req,res)=>{
    User.findOne({_id:req.params.id})
        .select("-password")
        .then(user=>{
            Post.find({postedBy:req.params.id})
                 .populate("postedBy","_id name")
                 .exec((err,posts)=>{
                    if(err){
                        return res.status(422).json({error:err})
                    }else{
                        return res.status(200).json({user,posts})
                    }
                 })
        })
})

//follow and following
// router.put('/follow',requireLogin,(req,res)=>{
//     User.findByIdAndUpdate(req.body.followId,{
//         $push:{followers:req.user._id}
//     },{
//         new:true
//     },(err,result)=>{
//         if(err){
//             return res.status(422).json({error:err})
//         }else{
//             User.findByIdAndUpdate(req.user._id,{
//                 $push:{following:req.body.followId}
//             },{
//                 new:true
//             })
//             .select("-password")
//             .then(result => res.json(result))
//         }
//     }
//     )
// })
router.put('/follow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(
      req.body.followId,
      { $push: { followers: req.user._id } },
      { new: true },
      (err, targetUser) => {
        if (err) {
          return res.status(422).json({ error: err });
        } else {
          User.findByIdAndUpdate(
            req.user._id,
            { $push: { following: req.body.followId } },
            { new: true }
          )
            .select("-password")
            .exec((err, loggedInUser) => {
              if (err) {
                return res.status(422).json({ error: err });
              } else {
                res.json({ loggedInUser, targetUser });
              }
            });
        }
      }
    );
  });
//unfollow
router.put('/unfollow',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.followId,{
        $pull:{followers:req.user._id}
    },{
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            User.findByIdAndUpdate(req.user._id,{
                $pull:{following:req.body.followId}
            },{
                new:true
            })
            .select("-password")
            .then(result => res.json(result))
        }
    }
    )
})




module.exports=router