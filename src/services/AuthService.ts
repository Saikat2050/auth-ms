import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import moment from "moment"

import CommonModel from "../models/CommonModel"
import {
	AuthDetails,
	AuthShortDetails,
	ChangePasswordPayload,
	CreateAuthPayload,
	CreateVerificationPayload,
	DecryptData,
	ForgetPassword,
	RegisterAPIPayload,
	ResetPasswordPayload,
	SendOtpByHashPayload,
	SignInPayload,
	VerifyOtpByHash
} from "../types/auths"
import {RoleDetails} from "../types/roles"
import {UserDetails, UserShortDetails} from "../types/users"

import helper, {
	decryptBycrypto,
	generateOtp,
	regexEmail,
	regexMobile
} from "../helpers/helper"
import {BadRequestException, UnauthorizedException} from "../libs/exceptions"
import {VerificationDetails} from "../types/verifications"

class AuthService {
	private authCredentialModel
	private roleModel
	private verificationModel
	private userModel
	private profileModel

	private authCreddentialIdColumn: string = "credentialId"
	private userIdColumn: string = "userId"
	private profileIdColumn: string = "profileId"
	private roleIdColumn: string = "roleId"
	private verificationIdColumn: string = "verificationId"
	constructor() {
		this.authCredentialModel = new CommonModel(
			"authCredentials",
			this.authCreddentialIdColumn,
			[]
		)
		this.roleModel = new CommonModel("roles", this.roleIdColumn, [])
		this.userModel = new CommonModel("users", this.userIdColumn, [])
		this.profileModel = new CommonModel(
			"profiles",
			this.profileIdColumn,
			[]
		)
		this.verificationModel = new CommonModel(
			"userVerifications",
			this.verificationIdColumn,
			[]
		)

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

	public async register(inputData: RegisterAPIPayload, slug: string) {
		try {
			await Promise.all([
				this.authCredentialModel.useSlug(slug),
				this.roleModel.useSlug(slug),
				this.userModel.useSlug(slug),
				this.verificationModel.useSlug(slug)
			])

			if (
				(inputData.email ?? "").toString().trim() === "" &&
				(inputData.mobile ?? "").toString().trim() === ""
			) {
				throw new BadRequestException(
					"Please enter a valid email id or mobile number.",
					"not_found"
				)
			}

			// Email validation
			if (inputData.email) {
				// check if email id is of valid format
				if (!(await helper.regexEmail(inputData.email))) {
					throw new BadRequestException("Invalid email id.")
				}

				// check if email id already exists
				const [emailExist]: AuthShortDetails[] =
					await this.authCredentialModel.list({
						userName: inputData.email,
						status: true
					})

				if (emailExist) {
					throw new BadRequestException("User email already exists.")
				}
			}

			// Mobile validation
			if (inputData.mobile) {
				// check if email id is of valid format
				if (!(await helper.regexMobile(inputData.mobile))) {
					throw new BadRequestException("Invalid mobile no.")
				}

				// check if email id already exists
				const [mobileExist]: AuthShortDetails[] =
					await this.authCredentialModel.list({
						userName: inputData.mobile,
						status: true
					})

				if (mobileExist) {
					throw new BadRequestException(
						"Mobile number already exists."
					)
				}
			}

			// encrypt password
			const isValidPassword: boolean = await helper.regexPassword(
				inputData.password
			)
			if (!isValidPassword) {
				throw new BadRequestException(
					"Password must be more then 8 char.",
					"validation_error"
				)
			}

			// validate roleid
			const [roleExist]: RoleDetails[] = await this.roleModel.list({
				roleId: inputData.roleId,
				status: true
			})

			if (!roleExist) {
				throw new BadRequestException(
					`Role id ${inputData.roleId} not found.`,
					"not_found"
				)
			}

			// create new user
			const [data]: [UserShortDetails] = await this.userModel.bulkCreate([
				{
					roleId: inputData.roleId,
					salutation: inputData.salutation,
					firstName: inputData.firstName,
					lastName: inputData.lastName,
					gender: inputData.gender,
					dob: inputData.dob,
					address: inputData.address,
					city: inputData.city,
					state: inputData.state,
					country: inputData.country,
					postalCode: inputData.postalCode
				}
			])

			// hashing password
			const salt: string = await bcrypt.genSalt(
				parseInt(process.env.SALT_ROUNDS as string)
			)
			const encryptedPassword = await bcrypt.hash(
				inputData.password.trim(),
				salt
			)

			const authPayload: CreateAuthPayload[] = []

			if (inputData.email) {
				authPayload.push({
					userId: data.userId,
					userName: inputData.email,
					password: encryptedPassword
				})
			}

			if (inputData.mobile) {
				authPayload.push({
					userId: data.userId,
					userName: inputData.mobile,
					password: encryptedPassword
				})
			}

			// create user auth credentials
			const userAuthCreation: AuthDetails[] =
				await this.authCredentialModel.bulkCreate(
					authPayload,
					data.userId
				)

			// sent verification link on email
			// encryption data
			const hashString: string = await helper.encryptionByCrypto({
				userId: data.userId,
				email: inputData.email
			})

			const link: string = `${process.env.BASE_URL_WEB}/verify?hash=${hashString}`

			// save hash in user
			await this.userModel.update(
				{
					secretHash: hashString
				},
				data.userId
			)

			// generate opt
			const otp: number = await helper.generateOtp()

			const encryptedOtp = await helper.encryptionByCrypto({
				otp,
				expiresIn: moment().add(
					Number(process.env.OTP_EXPIRATION_IN_MINUTES),
					"minutes"
				)
			})

			await Promise.all([
				// send verification link to mail by axios,
				// send otp to mobile by axios
			])

			const verificationDetails: CreateVerificationPayload[] = []
			if (inputData.email) {
				verificationDetails.push({
					userId: data.userId,
					value: inputData.email,
					otp: encryptedOtp
				})
			}

			if (inputData.mobile) {
				verificationDetails.push({
					userId: data.userId,
					value: inputData.mobile,
					otp: encryptedOtp
				})
			}

			// Verification details
			await this.verificationModel.bulkCreate(
				verificationDetails,
				data.userId
			)

			await Promise.all([
				this.authCredentialModel.removeSlug(),
				this.roleModel.removeSlug(),
				this.userModel.removeSlug(),
				this.verificationModel.removeSlug()
			])

			return data
		} catch (err) {
			throw err
		}
	}

	public async sendOtpWithHash(
		inputData: SendOtpByHashPayload,
		slug: string
	) {
		try {
			await Promise.all([
				this.authCredentialModel.useSlug(slug),
				this.roleModel.useSlug(slug),
				this.userModel.useSlug(slug),
				this.verificationModel.useSlug(slug)
			])

			const {hash}: SendOtpByHashPayload = inputData
			// check for valid hash
			const [userData]: UserDetails[] = await this.userModel.list({
				secretHash: hash.toString().trim()
			})

			if (!userData) {
				throw new BadRequestException("Invalid link")
			}

			// decrypt hash
			const decryptData: DecryptData = await decryptBycrypto(hash)
			const {email, userId}: DecryptData = decryptData

			// check if user exists
			const [authDetails]: AuthDetails[] =
				await this.authCredentialModel.list({
					userId,
					userName: email
				})
			if (!authDetails) {
				throw new BadRequestException("Invalid user.")
			}

			// generate otp
			const otp: number = await generateOtp()

			// create encryption
			const encryptedOtp: string = await helper.encryptionByCrypto({
				otp,
				expiresIn: moment().add(
					Number(process.env.OTP_EXPIRATION_IN_MINUTES),
					"minutes"
				)
			})

			// delete existing non-verified entries
			// await this.verificationModel.softDeleteByFilter(
			// 	{
			// 		value: email,
			// 		isVerified: false
			// 	},
			// 	userId
			// )

			const [verificationExists]: [VerificationDetails] =
				await this.verificationModel.list({
					userId,
					value: email,
					status: true
				})

			if (verificationExists) {
				await this.verificationModel.update(
					{
						value: email,
						isVerified: false,
						otp: encryptedOtp
					},
					verificationExists.verificationId,
					userId
				)
			} else {
				await this.verificationModel.bulkCreate(
					[
						{
							value: email,
							isVerified: false,
							otp: encryptedOtp
						}
					],
					userId
				)
			}

			// send otp to email
			// OTP to be sent by axios call
			return true
		} catch (err) {
			throw err
		}
	}

	public async verifyingByHashOtp(inputData: VerifyOtpByHash, slug: string) {
		try {
			await Promise.all([
				this.authCredentialModel.useSlug(slug),
				this.roleModel.useSlug(slug),
				this.userModel.useSlug(slug),
				this.verificationModel.useSlug(slug)
			])
			const {hash, otp}: VerifyOtpByHash = inputData
			const decryptData: DecryptData = await decryptBycrypto(hash)
			const {email, userId}: DecryptData = decryptData

			const [[userData], [verificationData]]: [
				[UserShortDetails],
				[VerificationDetails]
			] = await Promise.all([
				// check for valid hash
				this.userModel.list({
					secretHash: hash.toString().trim()
				}),
				// check if otp is valid
				this.verificationModel.list({
					value: email,
					isVerified: false,
					status: true
				})
			])

			if (!verificationData) {
				throw new BadRequestException("Invalid user.")
			}

			if (!userData) {
				throw new BadRequestException("Invalid link.")
			}

			let decoded: any = await decryptBycrypto(
				(verificationData?.otp).toString().trim()
			)

			if (
				parseInt(decoded?.otp) !== parseInt(otp.toString()) ||
				moment().diff(moment(decoded.expiresIn)) > 0
			) {
				throw new BadRequestException(
					"Invalid OTP. Please resend and try again."
				)
			}

			// mark OTP as used
			await this.verificationModel.update(
				{isVerified: true},
				verificationData.verificationId
			)

			// remove hash
			await this.userModel.update(
				{
					secretHash: null
				},
				userId
			)

			return true
		} catch (err) {
			throw err
		}
	}

	public async verifyOtpAndUpdatePassword(inputData: ResetPasswordPayload) {
		try {
			let {hash, otp, password}: ResetPasswordPayload = inputData

			// check for valid hash
			const [userData]: UserDetails[] = await this.userModel.list({
				secretHash: hash.toString().trim()
			})
			if (!userData) {
				throw new BadRequestException("Invalid link.")
			}

			// encrypt password
			const isValidPassword: boolean =
				await helper.regexPassword(password)
			if (!isValidPassword) {
				throw new BadRequestException(
					"Password must be more then 8 char.",
					"validation_error"
				)
			}

			// hashing password
			const salt: string = await bcrypt.genSalt(
				parseInt(process.env.SALT_ROUNDS as string)
			)
			password = await bcrypt.hash(password.trim(), salt)

			const decryptData: DecryptData = await decryptBycrypto(hash)
			const {email, userId} = decryptData

			// check if user & verification exist
			const [[authCredential], [verificationData]]: [
				[AuthDetails],
				[VerificationDetails]
			] = await Promise.all([
				// authCredential
				this.authCredentialModel.list({userName: email}),

				// verification
				this.verificationModel.list({
					value: email,
					isVerified: false,
					status: true
				})
			])

			// check if otp is valid
			let decoded: any = await decryptBycrypto(
				(verificationData?.otp).toString().trim()
			)

			if (
				parseInt(decoded?.otp) !== parseInt(otp.toString()) ||
				moment().diff(moment(decoded.expiresIn)) > 0
			) {
				throw new BadRequestException(
					"Invalid OTP. Please resend and try again."
				)
			}

			if (!authCredential && !verificationData) {
				await Promise.all([
					this.verificationModel.bulkCreate([
						{
							value: email,
							isVerified: true
						}
					]),

					// update password
					this.authCredentialModel.bulkCreate([
						{
							userId,
							userName: email,
							password
						}
					])
				])
			} else if (!authCredential) {
				await Promise.all([
					// update otp
					this.verificationModel.update(
						{isVerified: true},
						verificationData.verificationId
					),

					// update password
					this.authCredentialModel.bulkCreate([
						{
							userId,
							userName: email,
							password
						}
					])
				])
			} else if (!verificationData) {
				await Promise.all([
					// update otp
					this.verificationModel.bulkCreate([
						{
							value: email,
							isVerified: true
						}
					]),

					// update password
					this.authCredentialModel.update(
						{password},
						authCredential.credentialId
					)
				])
			} else {
				await Promise.all([
					// update otp
					this.verificationModel.update(
						{isVerified: true},
						verificationData.verificationId
					),

					// update password
					this.authCredentialModel.update(
						{password},
						authCredential.credentialId
					)
				])
			}

			// remove hash
			await this.userModel.update(
				{
					secretHash: null
				},
				userId
			)

			return true
		} catch (err) {
			throw err
		}
	}

	public async changePassword(inputData: ChangePasswordPayload) {
		try {
			let {email, previousPassword, newPassword}: ChangePasswordPayload =
				inputData

			// check for valid hash
			const [authData]: AuthDetails[] =
				await this.authCredentialModel.list({
					userName: email
				})

			if (!authData) {
				throw new BadRequestException("Invalid credentials.")
			}

			// encrypt password
			const isValidPassword: boolean =
				await helper.regexPassword(newPassword)
			if (!isValidPassword) {
				throw new BadRequestException(
					"Password must be more then 8 char!",
					"validation_error"
				)
			}

			// password comparison
			if (!(await bcrypt.compare(previousPassword, authData?.password))) {
				throw new UnauthorizedException("Invalid password.")
			}

			// new pass word encryption
			const salt: string = await bcrypt.genSalt(
				parseInt(process.env.SALT_ROUNDS as string)
			)
			const encryptedPassword = await bcrypt.hash(
				newPassword.trim(),
				salt
			)

			// remove hash
			await this.authCredentialModel.update(
				{
					password: encryptedPassword
				},
				authData.userId
			)

			return true
		} catch (err) {
			throw err
		}
	}

	public async forgotPassword(inputData: ForgetPassword) {
		try {
			// check if email id already exists
			const [userCredentialData]: AuthDetails[] =
				await this.authCredentialModel.list({
					userName: inputData.userName
				})

			if (!userCredentialData) {
				throw new BadRequestException("Invalid user.")
			}

			const [userData]: UserDetails[] = await this.userModel.list({
				userId: userCredentialData.userId
			})

			if (!userData) {
				throw new BadRequestException("Invalid user.")
			}

			if (await regexEmail(inputData.userName)) {
				// sent verification link on email
				// encryption data
				const hashString: string = await helper.encryptionByCrypto({
					userId: userCredentialData.userId,
					email: inputData.userName
				})

				const link: string = `${process.env.BASE_URL_WEB}/verify?hash=${hashString}`

				// save hash in user
				await this.userModel.update(
					{
						secretHash: hashString
					},
					userData.userId
				)

				// send verification mail
				// mail need to send by axios call
			} else if (await regexMobile(inputData.userName)) {
				// generate opt
				const otp: number = await helper.generateOtp()

				const encryptedOtp = await helper.encryptionByCrypto({
					otp,
					expiresIn: moment().add(
						Number(process.env.OTP_EXPIRATION_IN_MINUTES),
						"minutes"
					)
				})

				// send otp to mobile
				// need to send sms by axios

				const [verificationData]: [VerificationDetails] =
					await this.verificationModel.list({
						userId: userCredentialData.userId
					})

				if (verificationData) {
					await this.verificationModel.update(
						{
							userId: verificationData.userId,
							value: inputData.userName,
							otp: encryptedOtp
						},
						verificationData.verificationId
					)
				}
			}

			return true
		} catch (err) {
			throw err
		}
	}

	public async signIn(inputData: SignInPayload) {
		try {
			// check if userName is valid
			const [authCredential]: AuthDetails[] =
				await this.authCredentialModel.list({
					userName: inputData.userName
				})

			if (!authCredential) {
				throw new UnauthorizedException(
					"Invalid credential. Please try again"
				)
			}

			// check if user is valid
			const [verificationData]: VerificationDetails[] =
				await this.verificationModel.list({
					value: inputData.userName
				})

			if (!verificationData.isVerified) {
				throw new UnauthorizedException("User is not verified")
			}

			const isValidPassword: boolean = await bcrypt.compare(
				inputData.password,
				authCredential?.password
			)
			if (!isValidPassword) {
				throw new UnauthorizedException(
					"Invalid credential. Please try again"
				)
			}

			// update lastActiveOn
			await this.authCredentialModel.update(
				{lastActiveOn: moment().format("YYYY-MM-DD")},
				authCredential.userId
			)

			let [data]: UserShortDetails[] = await this.userModel.list({
				userId: authCredential.userId
			})

			delete data?.secretHash

			// generate token
			const token: string = jwt.sign(
				{
					userId: authCredential.userId,
					email: data?.email,
					mobile: data?.mobile
				},
				process.env.JWT_SECRET_KEY as string,
				{
					expiresIn: process.env.JWT_TOKEN_EXPIRATION as string
				}
			)

			return {token, data}
		} catch (err) {
			throw err
		}
	}

	public async refreshToken(accessToken: string) {
		try {
			// @ts-ignore
			accessToken = accessToken.split("Bearer").pop().trim()

			let decodedToken = jwt.decode(accessToken)
			if (!decodedToken) {
				throw new BadRequestException("Invalid token", "invalid_token")
			}

			// @ts-ignore
			delete decodedToken.iat
			// @ts-ignore
			delete decodedToken.exp
			// @ts-ignore
			delete decodedToken.nbf
			// @ts-ignore
			delete decodedToken.jti

			// generate new token
			const token: string = jwt.sign(
				// @ts-ignore
				decodedToken,
				process.env.JWT_SECRET_KEY as string,
				{
					expiresIn: process.env.JWT_TOKEN_EXPIRATION as string
				}
			)

			return token
		} catch (err) {
			throw err
		}
	}
}

export default new AuthService()
