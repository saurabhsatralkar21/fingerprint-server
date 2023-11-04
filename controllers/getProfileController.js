// const jwt = require('jsonwebtoken')

const getProfile = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://demofp.ssatralkar.com'); // client address
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    const {user} = req.user
    console.log("issue here");
    console.log(user);

    // if(!user) return res.sendStatus(404)

    // return res.json(user)
    
    // const {token} = req.cookies
    // console.log(`This is undefined: ${token}`);
    
    // if(token) {
    //    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user)=>{
    //        if(err) throw err
    //        res.json(user)
    //    })
    // } else {
    //    res.json(null)
    // }
    // console.log("Getting user");
}

module.exports = {getProfile}