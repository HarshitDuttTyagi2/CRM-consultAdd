const router = require("express").Router();
const passport = require("passport");
const { googleUser } = require("../controller/authController");


// router.get("/", (req, res) => {
//     console.log("req.user in /auth ", req.user)
//     res.send("<a href='/auth/google'>Login with Google</a>");
//   });

router.get('/callback', (req, res) => {
  const code = req.query.code;
  console.log("code in /auth/callback ", code)
  res.send("Inside callback method");
});

router.get("/failureRedirect", (req,res)=>{
    return res.status(400).json({
        error: "google login failed"
    })
})
  
  router.get(
    "/google",passport.authenticate("google", { scope: ["profile", "email"], prompt: 'select_account' })
  );
  
  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/failureRedirect" }),
    (req, res, next) => {
      console.log("Google authentication successful");
      googleUser(req, res, next);
    }
  );


module.exports = router;