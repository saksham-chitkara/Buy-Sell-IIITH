import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

async function verifyCaptcha (req, res, next){
    const captcha = req.body.captchaToken;
    console.log(captcha);

    if(!captcha){
        return res.status(401).json({ 
            msg: "CAPTCHA token is required" 
        });
    }
    console.log(captcha);

    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null,{
                params: {
                    secret: RECAPTCHA_SECRET_KEY,
                    response: captcha,
                },
            }
        );

        if(response.data.success){
            return next();
        } 

        else{
            return res.status(401).json({ 
                msg: "CAPTCHA verification failed" 
            });
        }
    } 
    
    catch(err){
        console.log(err);
        return res.status(401).json({ 
            msg: "Internal server error during CAPTCHA verification" 
        });
    }
}

export { verifyCaptcha }