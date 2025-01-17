import { z } from "zod";

const userSchema = z.object({
    first_name: z.string(),

    last_name: z.string(),

    email: z.string().email("Invalid email format").regex(/iiit\.ac\.in$/, "Email must be an IIIT email"), 

    age: z.number().int("Age must be an integer"),

    contact_no: z.string().regex(/^[0-9]{10}$/, "Contact number must be exactly 10 digits"),

    password: z.string()
});

const schema_without_pass = userSchema.omit({ password: true });

function validateInput(req, res, next){
    const response = userSchema.safeParse(req.body);
    if(response.success){
        next();
    }
    else{
        res.status(401).json({
            msg : "Please enter correct data!"
        })
        console.log(response.error);
    }
}

function validateInput_without_pass(req, res, next){
    req.body.age = Number(req.body.age);
    const response = schema_without_pass.safeParse(req.body);
    if(response.success){
        next();
    }
    else{
        res.status(401).json({
            msg : "Please enter correct data!"
        })
        console.log(response.error);
    }
}

export { validateInput, validateInput_without_pass};


