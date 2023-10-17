const User = require("../models/user")
const qrcode = require('qrcode')
const {authenticator} = require('otplib')


const Home = (req, res) => {
    res.json('Test is working')
}


const generateQRImage = async (req, res) => {
    try{
        const {email} = req.body;

        const secret = authenticator.generateSecret();
        const uri = authenticator.keyuri(email, "2FA Configuration", secret)
        const image = await qrcode.toDataURL(uri)
        const updateUser = await User.updateOne({email}, {MFASecret: secret})

        return res.send({
            success: true,
            image
        })
    }
    catch(error){
        console.log(error);
    }
}

const setMFAForUser = async(req, res) => {
    try{
        const {email, qrCode} = req.body;
        const getUser = await User.findOne({email})
        const verified = authenticator.check(qrCode, getUser.MFASecret)
        if(!verified){
            return res.json({
                error: "Invalid code. Try again!!"
            })
        }

        const updateUser = await User.updateOne({email}, {MFA: true}, {MFASecret: getUser.MFASecret})
        return res.json({
            success: "Verified! 2FA configured."
        })


    }catch (error){
        console.log(error);
    }
}

module.exports = {
    Home,
    generateQRImage,
    setMFAForUser
}