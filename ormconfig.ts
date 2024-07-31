import { MongooseModuleOptions } from "@nestjs/mongoose";
import * as dotenv from 'dotenv';

dotenv.config();
const mongooseConfig: MongooseModuleOptions = {
  uri: process.env.MONGO_DB_URI,  // Replace with your MongoDB URI
  // uri: 'mongodb+srv://mojo1234:PVKC0Av3vl7l2BSg@cluster0.j9xnr4p.mongodb.net/?retryWrites=true&w=majority', // Replace with your MongoDB URI
  // uri: process.env.MONGO_DB_URI || 'mongodb://127.0.0.1:27017', // Replace with your MongoDB URI
};

export default mongooseConfig;
