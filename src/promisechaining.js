require("./db/mongoose");
const Task = require("./models/task");

// Task.findByIdAndDelete("5fb5f565d7b2f259b8cff555").then((result) => {

//     return Task.find({ completed: false });
// }).then((result) => {
//     console.log(result);
// }).catch((err) => {
//     console.log(err);
// });




const deleteAndCount = async(id) => {
    const deleted = await Task.findOneAndDelete(id);
    const count = await Task.countDocuments();
    return count;
}

deleteAndCount("5fb5f565d7b2f259b8cff555").then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
});