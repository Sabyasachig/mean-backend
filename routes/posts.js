const express = require("express");
const multer = require("multer");
const Post = require('../models/post');
const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if(isValid){
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    console.log("EXT", name + '-' + Date.now() + '.' + ext);
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post('', multer({storage: storage}).single("image"), (req,res,next) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename
  });
  post.save().then(result => {
    res.status(201).json({
      message: 'Post Added successfully',
      post: {
        ...result, // advanced js all values and then override the id
        id: result._id,
      }
    });
  });

});

router.get('', (req, res, next) => {
    Post.find()
      .then(documents => {
        res.status(200).json({
          message: 'Posts fetched successfully!',
          posts: documents
        });
      });
});

router.get('/:id', (req, res, next) => {
    Post.findById(req.params.id)
      .then(post => {
        if(post){
          res.status(200).json(post);
        }else{
          res.status(404).json({message: 'Postnot found!'});
        }
      });
});

router.put('/:id', multer({storage: storage}).single("image"), (req, res, next) => {
  let imagepath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + '://' + req.get("host");
    imagepath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagepath
  });
  console.log(post);
  Post.updateOne({_id: req.params.id}, post )
    .then(documents => {
      res.status(200).json({
        message: 'Posts Updated successfully!'
      });
    });
});

router.delete('/:id', (req, res, next) => {
  console.log(req.params.id);
  Post.deleteOne({_id: req.params.id}).then(result => {
    console.log(result);
    res.status(200).json({
      message: 'Post deleted'
    });
  });
});

module.exports = router;
