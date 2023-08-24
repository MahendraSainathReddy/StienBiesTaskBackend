let mongoose = require('mongoose');
let dbUrl = "mongodb+srv://mahendrasainathreddy8:KTQ4FVVri4sHEcwR@cluster0.onhcggu.mongodb.net/SteinBiesTask";

async function dbConnect(){
    mongoose.connect(dbUrl)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });
}

module.exports ={
    dbConnect
}