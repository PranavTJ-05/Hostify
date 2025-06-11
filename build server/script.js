const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const {S3Client , PutObjectCommand} = require('@aws-sdk/client-s3');
const mimetypes = require('mimetypes'); // Assuming you have a package that provides MIME types


const s3Client = new S3Client({
    region: 'ap-south-1', // Change to your desired region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const PROJECT_ID=process.env.PROJECT_ID 

async function init(){
    console/log('Executing the scripts')
    const outDirPath = path.join(__dirname,'output')

    const p =exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data',function(data){
        console.log('stdout: ' + data.toString()); //here data is a buffer and it is converted to string
    })  // Capturing the logs here

    p.stdout.on('error',function(err){
        console.error('Error: ' + err.toString());
    })  //Capturing the errors here

    p.on('close',async function(){
        console.log("Build Completed Successfully");
        const distFolderPath = path.join(__dirname, 'output', 'dist');
        const distFolderContents = fs.readdirSync(distFolderPath,{recursive: true, withFileTypes: true});

        for(const file of distFolderContents) {
            const item = path.join(distFolderPath, file.name);
            if (fs.lstatSync(path.join(distFolderPath, item.name)).isDirectory()) continue;
            
            console.log("uploading",item)
            const command = new PutObjectCommand({
                Bucket: 'hostify-bucket ',  //This is my actual aws public bucket
                Key: `__output/${PROJECT_ID}/${item}`,
                Body: fs.createReadStream(item),
                ContentType: mimetypes.lookup()
            });
            // You may want to send the command using s3Client.send(command) here
            await s3Client.send(command);
            console.log("uploaded",item)
        }
        console.log("All files uploaded successfully");
    });  //Capturing the exit code of the child process
}

init()