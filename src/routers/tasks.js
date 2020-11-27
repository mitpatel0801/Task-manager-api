const express = require('express');
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();


router.post("/tasks", auth, async(req, res) => {
    const data = new Task({
        ...req.body,
        owner: req.user._id,
    })

    try {
        await data.save();
        res.status(201).send(data);
    } catch (error) {
        res.status(400).send(error);
    }
})



//tasks?completed=true
//tasks?limit=10&skip=20
//tasks?sortBy=createdAt:desc    
router.get("/tasks", auth, async(req, res) => {
    try {
        const match = {};
        const sort = {};
        if (req.query.completed) {
            match.completed = req.query.completed === "true";
        }

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(":");
            sort[parts[0]] = (parts[1] === "desc") ? -1 : 1;
        }
        await req.user.populate({
            path: "tasks",
            mathch,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (error) {
        res.status(500).send();
    }
})


router.get("/tasks/:id", auth, async(req, res) => {

    try {

        const result = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!result) {
            return res.status(404).send();
        }
        res.send(result);
    } catch (error) {
        res.status(500).send();
    }
})



router.patch("/tasks/:id", auth, async(req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdate = ["descripton", "completed"];
    const isValidField = updates.every((element) => {
        return allowedUpdate.includes(element);
    });

    if (!isValidField) {
        return res.status(404).send("Please enter valid field");
    }

    try {
        const oldData = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((keyElement) => {
            oldData[keyElement] = req.body[keyElement];
        })
        await oldData.save()

        res.send(task);
    } catch (error) {
        res.status(400).send();
    }

})


router.delete("/tasks/:id", auth, async(req, res) => {
    try {
        const data = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!data) {
            res.status(404).send();
        }
        res.send(data)
    } catch (error) {
        res.status(500).send();
    }
})


module.exports = router;