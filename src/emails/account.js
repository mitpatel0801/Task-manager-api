const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const welcomeMessage = (email, name) => {

    sgMail.send({
        to: email,
        from: "mit0801@my.yorku.ca",
        subject: "Thanks for joining in!",
        text: `Welcome to the app, ${name}. Let me know you get along with the app.`
    });

}

const cancelationMessage = (email, name) => {

    sgMail.send({
        to: email,
        from: "mit0801@my.yorku.ca",
        text: `Hi ${name}, We are inform you that your Task-manager account is successfully deleted now.` +
            `I Hope to see you back sometime soon.`,
        subject: "Sorry to see you go(Task-manger) "
    })
}
module.exports = {
    welcomeMessage,
    cancelationMessage
}