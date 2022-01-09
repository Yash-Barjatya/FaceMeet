const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
/**mongoose collection */
const Register = require('../models/newUser');
const Contact = require('../models/contact');
//JWT auth
const jwt = require('jsonwebtoken');
const JWT_SECRET = "FaceMeet";

const { v4: uuidV4 } = require('uuid')// will give a dynamic url
/* for server side local storage*/
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');

//ROUTES



router.get('/', async (req, res) => {

    try {
        res.status(201).render('index');
    }
    catch (err) {

        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });
    }
})

/**Get and Post req for Signup page */
router.get('/signup', async (req, res) => {

    try {
        res.status(201).render('sign_up');
    }
    catch (err) {

        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });
    }
})
router.post("/signup", async (req, res) => {

    try {
        const password = req.body.password;
        const confirm_password = req.body.confirm_password;
        if (password === confirm_password) {
            const registerUser = new Register({
                Name: req.body.Name,
                email: req.body.email,
                password: req.body.password,//password:password latter password is the one defined earlier in few lines back
                confirm_password: req.body.confirm_password
            })

            /**password hashing: Middleware */
            /**once we get the password then before saving it to db we need to hash it  */

            const registered = await registerUser.save();
            // console.log(registered);
            // console.log(registered.id);
            const data = {
                registered: {
                    id: registered.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);
            // console.log("authToken upon signup " + authToken)
            localStorage.setItem('token', authToken)
            res.redirect('/home')
        }
        else {
            res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: "Password are not matching" });
        } /*
        console.log(req.body.Name)
        res.send(req.body.Name)// the name attribute of ech label of form has to be wriiten exactly
    */
    }
    catch (err) {

        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });

    }
})

/**Get and Post req for Signin page */


router.get('/signin', async (req, res) => {

    try {
        res.render('sign_in');
    }
    catch (err) {

        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });

    }
})
router.post('/signin', async (req, res) => {

    try {
        const email = req.body.email
        const password = req.body.password
        const userEmail = await Register.findOne({ email: email });/*Register == name of db collection */
        // now how  to compare login password with the hashed password
        const isMatch = await bcrypt.compare(password, userEmail.password)
        /* res.send(userEmail);// will retuen the entire user detail*/
        // console.log(userEmail);
        const data = {
            userEmail: {
                id: userEmail.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        if (isMatch) {
            localStorage.setItem('token', authToken);
            res.redirect('/home')

        }
        else {
            res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: "Invalid login credentials" });

        }

        //console.log(`A user with email = ${email} and password = ${password} just loged in`)
    }
    catch (err) {
        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });

    }
})
/**Home page login required  */

router.get('/home', async (req, res) => {

    try {
        if (localStorage.getItem('token')) {
            res.status(201).render('home');


        }
        else
            res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: "Unauthorized access. No user found.Please signin/signup to continue" });
    }
    catch (err) {

        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });

    }
})
/**Logout page login required  */

router.get('/logout', async (req, res) => {

    try {
        localStorage.removeItem('token');
        res.redirect('/signin');
    }
    catch (err) {

        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });

    }
})
/**About  */

router.get('/about', async (req, res) => {

    try {
        res.status(201).render('about');
    }
    catch (err) {

        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });
    }
})
/*fkor contact form submission*/
router.post("/about", async (req, res) => {

    try {
        const contactUser = new Contact({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message
        })


        const contacted = await contactUser.save();
        res.status(201).render('feedback', { feedback_heading: "Success :)", feedback_title: "Thank you!!", feedback_message: "Your response has been submitted.We will revert back to you soon." });
    }
    catch (err) {

        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });

    }
})

/**if meet ends redirect to home page */
router.get('/end_meet', (req, res) => {
    try {

        res.redirect('/home')
    }
    catch (err) {
        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });

    }
})
/* meet and room */
router.get('/meet', (req, res) => {
    try {
        if (localStorage.getItem('token')) {
            res.redirect(`${uuidV4()}`)
        }
        else
            res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: "Unauthorized access. No user found.Please signin/signup to continue" });
    }
    catch (err) {
        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });

    }
})
router.get('/:room', (req, res) => {
    try {


        if (localStorage.getItem('token')) {
            res.render('room', { roomId: req.params.room })
        }
        else
            res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: "Unauthorized access. No user found.Please signin/signup to continue" });

    } catch (err) {
        res.status(400).render('feedback', { feedback_heading: "Error :(", feedback_title: "Oops!!", feedback_message: err });

    }

})

/*end  */
module.exports = router;