const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb+srv://dust-to-crown:dusttocrown123@cluster0.lsysn.mongodb.net/dusttocrowndb?retryWrites=true&w=majority');
  const Homework = mongoose.model('Homework', new mongoose.Schema({}, {strict: false, collection: 'homeworks'}));
  
  const hw = await Homework.find().sort({createdAt: -1}).limit(5);
  console.log("Recent Homeworks:");
  console.log(JSON.stringify(hw, null, 2));
  
  process.exit(0);
}
test();
