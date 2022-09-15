const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Tour = require("./../models/tourModel");
const fs = require("fs");

dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("Success");
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8"));
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Loaded data");
    process.exit()
} catch (error) {
    console.log(error);
  }
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Deleted all data");
    process.exit()
  } catch (error) {
    console.log(error);
  }
};

if(process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}