import express, {Router} from "express"

import AuthController from "../controllers/AuthController"

//routes
export class AuthRouter {
	public readonly router: Router
	constructor() {
		this.router = express.Router()
		this.router
			.post("/register", AuthController.register)
			.post("/send-otp-hash", AuthController.sendOtpWithHash)
			.post("/verify-otp-by-hash", AuthController.verifyingByHashOtp)
			// .post("/reset-password", AuthController.resetPassword)
			.post(
				"/verify-otp-and-reset-password",
				AuthController.verifyOtpAndUpdatePassword
			)
			.post("/forgot-password", AuthController.forgotPassword)
			.post("/change-password", AuthController.changePassword)
			.post("/sign-in", AuthController.signIn)
			.post("/refresh-token", AuthController.refreshToken)
	}
}
