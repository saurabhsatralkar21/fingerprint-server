const User = require("../models/user")
const {hashPassword, comparePassword} = require('../helpers/auth')
const jwt = require('jsonwebtoken')
const qrcode = require('qrcode')
const {authenticator} = require('otplib')


// Login Endpoint
const loginUser = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://demofp.ssatralkar.coom'); // client address
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    try{
        const {email, password, visitorId} = req.body;

        // Check if user exists
        const user = await User.findOne({email})

        if(!user){
            return res.json({
                error: 'No user found'
            })
        }

        // Check if password matches
        const match = await comparePassword(password, user.password)
        if(!match) {
            res.json({
                error: 'Password incorrect'
            })
        }

        if(match) {
            console.log("User found. Checking if suspicious");
            const suspiciousVisitor = await User.find({visitorId}, {suspiciousActivity: true})
            const hasSuspiciousActivity = suspiciousVisitor.some(item => item.suspiciousActivity === true)
            if(hasSuspiciousActivity) {
                console.log("Suspicious user. Blocking them");
                return res.json({
                    error: "Something went wrong!!\nReach out to our support team for help."
                })
            } else {
                console.log("User is not suspicious. Loggin in!!");
                
                // Check if 2-FA is enabled
                console.log(user.MFA);
                if(user.MFA === false){
                    console.log("Success but redirecting to MFA page");

                    const accessToken = jwt.sign(
                        {"email": user.email, "id": user._id, "name": user.name},
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: '50000s'}
                        )

                    const refreshToken = jwt.sign(
                            {"email": user.email, "id": user._id, "name": user.name},
                            process.env.REFRESH_TOKEN_SECRET,
                            { expiresIn: '1d'}
                            )

                    const updateUser = await User.updateOne({email}, {refreshToken: refreshToken})
                    console.log("User updated with refresh token");

                    res.cookie('refreshToken',
                        refreshToken, 
                        {   
                            httpOnly: true,
                            maxAge: 24 * 60 * 60 * 1000
                        })
                    
                    return res.json(
                        { 
                            success: "User logged in", 
                            accessToken, 
                            refreshToken, 
                            warning: "Multi factor authentication not set",
                        })
                }


                if(user.MFA === true){

                    console.log("Sending to 2FA page to put the code");
                    const accessToken = jwt.sign(
                        {"email": user.email, "name": user.name},
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: '50000s'}
                        )

                    const refreshToken = jwt.sign(
                            {"email": user.email, "name": user.name},
                            process.env.REFRESH_TOKEN_SECRET,
                            { expiresIn: '1d'}
                            )

                    const updateUser = await User.updateOne({email}, {refreshToken: refreshToken})
                    console.log("User updated with refresh token");

                    res.cookie('refreshToken', 
                        refreshToken, 
                        {
                            httpOnly: true, 
                            maxAge: 24 * 60 * 60 * 1000
                        })

                    return res.json(
                        {
                            success: "User logged in", 
                            accessToken, 
                            refreshToken, 
                            authenticate: "Authenticate with 2FA"
                        })

                }
            
                
            }
        } 
        
    }
    catch(error) {
        console.log(error);
    }
}

module.exports = {loginUser}