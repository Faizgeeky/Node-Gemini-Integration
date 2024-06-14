import mongoose from "mongoose";
// mongoose.connect('mongodb+srv://user_answer_ai:NMC28Civ6YsCbXJq@cluster0.rybkh6d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

// mongoose.connect('mongodb+srv://user_answer_ai:UImypj5iTc6I5McK@cluster0.rybkh6d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
// const uri = "mongodb+srv://<username>:<password>@cluster0.rybkh6d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// user_answer_ai
// UImypj5iTc6I5McK
// blog_app/config/db.js

// import mongoose from "mongoose";

// export default function connectDB() {
//     const url = "mongodb://127.0.0.1/blog_db";

//     try {
//         mongoose.connect(url, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//     } catch (err) {
//         console.error(err.message);
//         process.exit(1);
//     }
//     const dbConnection = mongoose.connection;
//     dbConnection.once("open", (_) => {
//         console.log(`Database connected: ${url}`);
//     });

//     dbConnection.on("error", (err) => {
//         console.error(`connection error: ${err}`);
//     });
//     return;`
// }

import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
