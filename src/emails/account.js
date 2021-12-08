const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "allan.k1291@gmail.com",
        subject: "Thanks for joining in!",
        // you can only use the template strings syntax with the back-tics only.
        text: `Welcome to our App, ${name}. Let me know how you get along with the app`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "allan.k1291@gmail.com",
        subject: "We regret to see you leave.",
        text: `Good bye, ${name}. I hope to see you back some time soon
        `
    })
}

// export multiple files
module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}