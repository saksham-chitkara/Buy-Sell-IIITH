"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRecaptcha = void 0;
const recaptcha_enterprise_1 = require("@google-cloud/recaptcha-enterprise");
const createAssessment = (_a) => __awaiter(void 0, [_a], void 0, function* ({ projectID, recaptchaKey, token, recaptchaAction, }) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    const client = new recaptcha_enterprise_1.RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(projectID);
    try {
        const [response] = yield client.createAssessment({
            assessment: {
                event: {
                    token: token,
                    siteKey: recaptchaKey,
                },
            },
            parent: projectPath,
        });
        // Check token validity
        if (!((_b = response.tokenProperties) === null || _b === void 0 ? void 0 : _b.valid)) {
            console.log(`Token validation failed: ${(_c = response.tokenProperties) === null || _c === void 0 ? void 0 : _c.invalidReason}`);
            return null;
        }
        // Verify action match
        if (((_d = response.tokenProperties) === null || _d === void 0 ? void 0 : _d.action) !== recaptchaAction) {
            console.log("Action mismatch in reCAPTCHA verification");
            console.log((_e = response.tokenProperties) === null || _e === void 0 ? void 0 : _e.action);
            console.log(recaptchaAction);
            return null;
        }
        // Log score and reasons
        console.log(`reCAPTCHA score: ${(_f = response.riskAnalysis) === null || _f === void 0 ? void 0 : _f.score}`);
        (_h = (_g = response.riskAnalysis) === null || _g === void 0 ? void 0 : _g.reasons) === null || _h === void 0 ? void 0 : _h.forEach((reason) => {
            console.log(`Risk reason: ${reason}`);
        });
        return (_j = response.riskAnalysis) === null || _j === void 0 ? void 0 : _j.score;
    }
    catch (error) {
        console.error("reCAPTCHA assessment error:", error);
        return null;
    }
    finally {
        // Clean up client resources
        client.close();
    }
});
const verifyRecaptcha = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recaptchaToken, recaptchaAction = "default_action" } = req.body;
        if (!recaptchaToken) {
            res.status(400).json({ message: "reCAPTCHA token is required" });
            return;
        }
        const score = yield createAssessment({
            projectID: process.env.RECAPTCHA_PROJECT_ID,
            recaptchaKey: process.env.RECAPTCHA_SITE_KEY,
            token: recaptchaToken,
            recaptchaAction,
        });
        if (score === null) {
            res.status(400).json({ message: "reCAPTCHA verification failed" });
            return;
        }
        if (score < 0.5) {
            res.status(400).json({ message: "High risk activity detected" });
            return;
        }
        req.recaptchaScore = score;
        next();
    }
    catch (error) {
        console.error("reCAPTCHA middleware error:", error);
        res.status(500).json({ message: "reCAPTCHA verification error" });
        return;
    }
});
exports.verifyRecaptcha = verifyRecaptcha;
