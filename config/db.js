const mongoose = require('mongoose')

const dbURI = 'mongodb+srv://atulsen:Y_53h64LyPLHPC6@cluster0.0flk3.mongodb.net/astro_one';

const dbURII = 'mongodb+srv://Atull:LG5qwrMWK_WscjJ@cluster0.0flk3.mongodb.net/astro_one';
// const dbURI = 'mongodb://localhost:27017/AstroOne'


module.exports = function dbConnection() {
    mongoose.connect(dbURI, {bufferCommands: false})
    console.log("connected to database")
}