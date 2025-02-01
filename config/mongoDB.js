import mongoose from 'mongoose'


export async function connectDB() {
    mongoose.connect('mongodb+srv://ppuchetadev:6awQJNg5WD5GD6vq@cluster0.7yzio5l.mongodb.net/')
    .then(console.log("Conectado a mongoDB"))
}