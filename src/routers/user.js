const express = require('express');
const User = require("../models/user");
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { welcomeMessage, cancelationMessage } = require("../emails/account");

const router = new express.Router();

router.post("/users", async(req, res) => {
    const userData = new User(req.body);
    try {
        await userData.save();
        const token = await userData.generateAuthToken();
        welcomeMessage(userData.email, userData.name);
        res.status(201).send({ userData, token });
    } catch (error) {
        res.status(400).send(error);
    }

})

router.post("/users/login", async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send();
    }
})

router.post("/users/logout", auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

router.post("/users/logoutAll", auth, async(req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
})
router.get("/users/me", auth, async(req, res) => {
    res.send(req.user);
})

router.get("/users/:id", async(req, res) => {

    try {
        const result = await User.findById(req.params.id);
        if (!result) {
            return res.status(404).send();
        }
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }

})

router.patch("/users/me", auth, async(req, res) => {
    const allowedUpdate = ["name", "email", "age", "password"];
    const updates = Object.keys(req.body);
    const isValidField = updates.every((element) => {
        return allowedUpdate.includes(element);
    });

    if (!isValidField) {
        return res.status(400).send({ error: "Invalid Updates!" });
    }

    try {

        updates.forEach((keyElement) => {
            req.user[keyElement] = req.body[keyElement];
        })

        await req.user.save();

        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.delete("/users/me", auth, async(req, res) => {
    try {
        await req.user.remove();
        cancelationMessage(req.user.email, req.user.name);
        res.send(req.user);
    } catch (error) {
        res.status(500).send();
    }
})

const upload = multer({

    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload an image"));
        }

        cb(undefined, true);
    }
})


router.post("/users/me/avatar", auth, upload.single("avatar"), async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})


router.delete("/users/me/avatar", auth, async(req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send();
})

router.get("/users/:id/avatar", async(req, res) => {
    try {
        const User = await User.findById(req.params.id);

        if (!User || User.avatar) {
            throw new Error();
        }

        res.set("Contect-Type", "image/png");
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();
    }
})

module.exports = router;