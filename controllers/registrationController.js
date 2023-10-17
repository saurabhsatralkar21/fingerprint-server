const User = require("../models/user")
const {hashPassword, comparePassword} = require('../helpers/auth')
const jwt = require('jsonwebtoken')
const qrcode = require('qrcode')
const {authenticator} = require('otplib')

const registerUser = async (req, res) => {

    try {
        const {name, email, password, visitorId} = req.body;

        // Check if name was entered
        if(!name){
            return res.json({
                error: 'Name is required!!'
            })
        }

        // Check if the password meet the criteria
        if(!password || password.length < 6){
            return res.json({
                error: 'Password is required and should be more than 6 characters'
            })
        }

        if(!email){
            return res.json({
                error: 'Email address is required!!'
            })
        }

        // Check email if it exists in the Database
        const exists = await User.findOne({email});
        if(exists) {
            return res.json({
                error: 'Email address is already in use'
            })
        }

        // Check the suspiciousActivity flag on the visitorID
        // const suspiciousVisitor = await User.find({visitorId}, {suspiciousActivity: true})
        // if(suspiciousVisitor.length != 0 && suspiciousVisitor.suspiciousActivity == true) {
        //     console.log("Suspicious user. Blocking them");
        //     return res.json({
        //         error: "Something went wrong!! Reach out to our support team for help."
        //     })
        // }

        const suspiciousVisitor = await User.find({visitorId}, {suspiciousActivity: true})
        const hasSuspiciousActivity = suspiciousVisitor.some(item => item.suspiciousActivity === true)
        if(hasSuspiciousActivity) {
            console.log("Suspicious user. Blocking them");
        return res.json({
            error: "Something went wrong!! Reach out to our support team for help."
        })
        }

        // Check if any suspicious activity from the visitorID
        const fingerprintVisitorID = await User.findOne({visitorId})
        console.log("Looking for FP id in Database")
        if(fingerprintVisitorID) { // If Fingerprint ID exists, find all the users registered under that ID
            const getRegisteredUser = await User.find({visitorId}) // Array of all objects with the same visitorID
            console.log("Registered user found: ");
            console.log(getRegisteredUser);
            for (let i = 1; i < getRegisteredUser.length; i++) {
                const prevCreatedAt = getRegisteredUser[i - 1].createdAt;
                const currentCreatedAt = getRegisteredUser[i].createdAt;
              
                const timeDifferenceInMilliseconds = currentCreatedAt - prevCreatedAt;
                const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (1000 * 60);
              
                // Checking the time difference. If the user is trying to register 3 times in a minutes
                // mark them as as suspicious user
                if(timeDifferenceInMinutes < 1 && getRegisteredUser.length > 3 ) {
                    console.log("Marking visitorID as suspicious activity");
                    // Update all the registered documents from the same visitor and mark them as 
                    // suspicious activity - 'true'
                    const suspiciousVisitor = await User.updateMany({visitorId}, {suspiciousActivity: true})
                    return res.json({
                        error: "Something went wrong!! Reach out to our support team for help."
                    })
                }
                else {
                    console.log("Safe to register");
                }
              }
            }

        // Hash the password
        const hashedPassword = await hashPassword(password)

        // Create the user in the Database
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword, 
            visitorId,
        })

        // Return the newly created user
        return res.json(user)

    }
    catch(error) {
        console.log(error);
    }

}


module.exports = {registerUser}