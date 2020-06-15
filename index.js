require('dotenv/config')
const express = require('express');
const multer = require('multer')
const app = express();
const AWS = require('aws-sdk')
const uuid = require('uuid/v4');

app.use(express.urlencoded({
    extended: true
}));
const port = process.env.PORT || 5000

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACEESS_SECRET 
});

// When using memory storage, the file info will contain a field called buffer that contains the entire file.
const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '')
    }
});
console.log(storage);

const  upload = multer({ storage: storage }).single('image');

app.post('/upload', upload, (req, res)=>{
    let myFile= req.file.originalname.split(".")
    console.log(myFile);
    const fileType = myFile[myFile.length - 1]
    console.log(req.file);  // use req.files if we are uplaoding multiple files 
    // res.send({
    //     message: "hello world "
    // })
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuid()}.${fileType}`,
        Body: req.file.buffer
    }
    s3.upload(params, (error, data)=>{
        if(error){
            res.status(500).send({
                message: 'an error occured'
            })
        }
        res.status(200).send(data);
    })
});


app.listen(port, () => console.log(`Server started on port ${port}`));
