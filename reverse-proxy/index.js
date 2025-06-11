const express = require('express');
const httpProxy = require('http-proxy');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH

app.use((req,res)=>{
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    const resolveTo = `https://hostify-bucket.s3.ap-south-1.amazonaws.com/_outputs/${subdomain}`
})

app.listen(PORT, () => {console.log(`Reverse Proxy listening on port ${PORT}`);});

