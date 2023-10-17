const User = require("../models/user")
const jwt = require('jsonwebtoken')

require("dotenv").config()

const handleRefreshToken = async (req, res) => {
    // const cookies = req.cookies

    // if(!cookies?.jwt) return res.sendStatus(401)

    // console.log(cookies.jwt);
    // console.log("Cookie JWT");

    // const refreshToken = cookies.jwt
    // console.log(`Refersh token: ${refreshToken}`);
    // const foundUser = await User.findOne({refreshToken: refreshToken})
    // console.log(foundUser);
    

    // if(foundUser.refreshToken !== refreshToken) return res.sendStatus(403); // Forbidden

    // jwt.verify(
    //     refreshToken,
    //     process.env.REFRESH_TOKEN_SECRET,
    //     (err, decoded) => {
    //         console.log(process.env.REFRESH_TOKEN_SECRET);
    //         console.log(decoded);
    //         if(err || foundUser.email !== decoded.email) return res.sendStatus(403)
    //         const accessToken = jwt.sign(
    //         {"email": decoded.email},
    //         process.env.ACCESS_TOKEN_SECRET,
    //         {expiresIn: '5m'})

    //     res.json({accessToken})
    //     }
    // )

    try {
        console.log("In refresh token");
        const refreshToken = req.cookies.refreshToken;
        console.log(refreshToken);
        if(!refreshToken) return res.sendStatus(401);
        const user = await User.findOne({refreshToken: refreshToken});

        if(!user) return res.sendStatus(403);

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {

            if(err) return res.sendStatus(403);

            const name = user.name;
            const email = user.email;
            const accessToken = jwt.sign({name, email}, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '3m'
            });
            
            res.json({ accessToken });
        });
    } catch (error) {
        console.log(error);
    }


}

module.exports = {handleRefreshToken}