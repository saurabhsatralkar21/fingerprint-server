const User = require("../models/user")

const Logout = async(req, res) => {

    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken) return res.sendStatus(204);
    const user = await User.findOne({refreshToken: refreshToken});

    if(!user) return res.sendStatus(204);
    
    await User.updateOne({email: user.email},{refreshToken: ""});

    res.clearCookie('refreshToken');
    
    return res.sendStatus(200);
}

module.exports = {Logout}