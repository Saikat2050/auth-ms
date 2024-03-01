import {NextFunction, Request, Response} from "express"

import {ApiResponse} from "../libs/ApiResponse"
import {BadRequestException} from "../libs/exceptions"
import eventEmitter from "../libs/logging"
import authService from "../services/AuthService"

class AuthController {
	constructor() {
		this.register = this.register.bind(this)
		this.sendOtpWithHash = this.sendOtpWithHash.bind(this)
		this.verifyingByHashOtp = this.verifyingByHashOtp.bind(this)
		this.verifyOtpAndUpdatePassword =
			this.verifyOtpAndUpdatePassword.bind(this)
		this.changePassword = this.changePassword.bind(this)
		this.forgotPassword = this.forgotPassword.bind(this)
		this.signIn = this.signIn.bind(this)
		this.refreshToken = this.refreshToken.bind(this)
	}

	public async register(req: Request, res: Response, next: NextFunction) {
		const response = new ApiResponse(res)
		try {
			await response.accumulatedAPITransactionBegin()

			const data = await authService.register(
				req.body,
				req.headers.slug as string
			)

			// return response
			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
				message: `User created successfully`,
				data
			})
		} catch (error) {
			await response.accumulatedAPITransactionFailed()

			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	public async sendOtpWithHash(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const response = new ApiResponse(res)
		try {
			await response.accumulatedAPITransactionBegin()

			await authService.sendOtpWithHash(
				req.body,
				req.headers.slug as string
			)

			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
				message: `OTP sent successfully`
			})
		} catch (error) {
			await response.accumulatedAPITransactionFailed()

			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	public async verifyingByHashOtp(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const response = new ApiResponse(res)
		try {
			await response.accumulatedAPITransactionBegin()

			await authService.verifyingByHashOtp(
				req.body,
				req.headers.slug as string
			)

			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
				success: true,
				message: `OTP verified successfully`
			})
		} catch (error) {
			await response.accumulatedAPITransactionFailed()

			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	public async verifyOtpAndUpdatePassword(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const response = new ApiResponse(res)
		try {
			await response.accumulatedAPITransactionBegin()

			await authService.verifyOtpAndUpdatePassword(req.body)

			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
				success: true,
				message: `Otp verified and password updated successfully.`
			})
		} catch (error) {
			await response.accumulatedAPITransactionFailed()

			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	// change password
	public async changePassword(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const response = new ApiResponse(res)
		try {
			await response.accumulatedAPITransactionBegin()

			await authService.changePassword(req.body)

			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
				success: true,
				message: `Password updated successfully.`
			})
		} catch (error) {
			await response.accumulatedAPITransactionFailed()
			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	// will send verification mail
	public async forgotPassword(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const response = new ApiResponse(res)
		try {
			await response.accumulatedAPITransactionBegin()

			await authService.forgotPassword(req.body)

			await response.accumulatedAPITransactionSucceed()
			// return response
			return response.successResponse({
				success: true,
				message: `Verification link sent successfully.`
			})
			// }
		} catch (error) {
			await response.accumulatedAPITransactionFailed()
			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	public async signIn(req: Request, res: Response, next: NextFunction) {
		const response = new ApiResponse(res)
		try {
			await response.accumulatedAPITransactionBegin()

			const {data, token} = await authService.signIn(req.body)

			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
				message: `Sign-in successful`,
				token,
				data
			})
		} catch (error) {
			await response.accumulatedAPITransactionFailed()
			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	public async refreshToken(req: Request, res: Response, next: NextFunction) {
		try {
			const response = new ApiResponse(res)
			let accessToken: string = req.headers.authorization as string
			if (!accessToken) {
				throw new BadRequestException(
					"Missing authorization header",
					"invalid_token"
				)
			}

			const token = await authService.refreshToken(accessToken)

			return response.successResponse({
				message: `Refresh token generated successfully`,
				token
			})
		} catch (error) {
			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}
}

export default new AuthController()
