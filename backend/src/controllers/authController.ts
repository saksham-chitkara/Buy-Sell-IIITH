import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { parseStringPromise } from "xml2js";
import { validateEmail } from "../utils/validators";

interface CASAttributes {
  "cas:clientIpAddress": string[];
  "cas:RollNo": string[];
  "cas:E-Mail": string[];
  "cas:isFromNewLogin": string[];
  "cas:authenticationDate": string[];
  "cas:FirstName": string[];
  "cas:successfulAuthenticationHandlers": string[];
  "cas:userAgent": string[];
  "cas:Name": string[];
  "cas:credentialType": string[];
  "cas:samlAuthenticationStatementAuthMethod": string[];
  "cas:uid": string[];
  "cas:authenticationMethod": string[];
  "cas:serverIpAddress": string[];
  "cas:longTermAuthenticationRequestTokenUsed": string[];
  "cas:LastName": string[];
}

interface CASResponse {
  "cas:serviceResponse"?: {
    "cas:authenticationSuccess"?: [
      {
        "cas:user": string[];
        "cas:attributes": [CASAttributes];
      }
    ];
  };
}

interface TempUser {
  email: string;
  firstName: string;
  lastName: string;
  casVerified: boolean;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      contactNumber,
      recaptchaToken,
    } = req.body;

    req.body.recaptchaAction = "register";

    if (!validateEmail(email)) {
      res.status(400).json({
        message: "Invalid email domain. Please use your IIIT email.",
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      age,
      contactNumber,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, recaptchaToken } = req.body;

    req.body.recaptchaAction = "login";

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const verifyCASTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { ticket } = req.body;

    if (!ticket) {
      res.status(400).json({ error: "Ticket is required" });
      return;
    }

    const serviceUrl = encodeURIComponent(
      `${process.env.FRONTEND_URL}/auth/cas/callback`
    );
    const validationUrl = `https://login.iiit.ac.in/cas/serviceValidate?ticket=${ticket}&service=${serviceUrl}`;

    const response = await fetch(validationUrl);
    const xmlResponse = await response.text();
    const result = (await parseStringPromise(xmlResponse)) as CASResponse;

    const authSuccess =
      result["cas:serviceResponse"]?.["cas:authenticationSuccess"]?.[0];
    if (!authSuccess) {
      console.error("CAS authentication failed:", result);
      res.status(401).json({ error: "CAS authentication failed" });
      return;
    }

    const email = authSuccess["cas:attributes"]?.[0]?.["cas:E-Mail"]?.[0];
    const fName = authSuccess["cas:attributes"]?.[0]?.["cas:FirstName"]?.[0];
    const lName = authSuccess["cas:attributes"]?.[0]?.["cas:LastName"]?.[0];

    if (!email) {
      res.status(401).json({ error: "Email not found in CAS response" });
      return;
    }
    //TODO: updated the expiries everywhere
    // Find existing user
    let user = await User.findOne({ email });

    if (user) {
      user.isVerified = true;
      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );
      res.json({
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
          avatar: user.avatar,
        },
        requiresAdditionalDetails: false,
      });
    } else {
      const tempToken = jwt.sign(
        {
          email,
          firstName: fName,
          lastName: lName,
          casVerified: true,
        } as TempUser,
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );
      res.json({
        tempToken,
        requiresAdditionalDetails: true,
        userData: {
          email,
          firstName: fName,
          lastName: lName,
        },
      });
    }
  } catch (error) {
    console.error("CAS verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const completeCASRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tempToken, age, contactNumber, ...additionalFields } = req.body;

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!) as TempUser;

    if (!decoded.casVerified) {
      res.status(401).json({ error: "Invalid registration token" });
      return;
    }

    // Create the user with all details
    const user = await User.create({
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      age,
      contactNumber,
      ...additionalFields,
      isVerified: true,
    });

    // Generate final authentication token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
