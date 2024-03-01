import {Range, OrderDir, Manipulator, Timestamp} from "./common"
import {RoleDetails} from "./roles"

export type AuthTableData = {
	credentialId: number
	userId: number
	userName: string
	password: string
	status: boolean
} & Manipulator &
	Timestamp

export type AuthShortDetails = {
	credentialId: number
	userId: number
	userName: string
	password: string
	status: boolean
}

export type RegisterAPIPayload = {
	roleId: number
	salutation: string
	firstName: string
	lastName?: string
	gender?: string
	dob?: string
	email?: string
	mobile?: string
	password: string
	address?: string
	city?: string
	state?: string
	country?: string
	postalCode?: string
}

export type AuthDetails = {
	role: RoleDetails | null
} & AuthShortDetails

export type CreateAuthPayload = {
	userId: number
	userName?: string
	password: string
}

export type CreateVerificationPayload = {
	userId: number
	value: string
	otp?: string
}

type FilterAuthPayload = Partial<{
	userId: number | number[]
	email: string
	mobile: string
	createdAt: string
	search: string
}>

export type ListAuthPayload = {
	filter?: FilterAuthPayload
	range?: Range
	sort?: {
		orderBy?: keyof AuthShortDetails
		orderDir?: OrderDir
	}
}

export type UpdateAuthPayload = {
	credentialId: number
} & Partial<{
	userId: number
	email: string
	mobile: string
	password: string
}>

export type DeleteAuthPayload = {
	credentialId: number[] | number
}

export type SignInPayload = {
	userName: string
	password: string
}

export type VerifyOtpPayload = {
	userName?: string
	hash?: string
	otp: number
}

export type ResetPasswordPayload = {
	hash: string
	otp: number
	password: string
}

export type ChangePasswordPayload = {
	email: string
	previousPassword: string
	newPassword: string
}

export type SendOtpPayload = {
	email: string
}

export type ForgetPassword = {
	userName: string
}

export type DecryptData = {
	userId: number
	email: string
}

export type SendOtpByHashPayload = {
	hash: string
}

export type VerifyOtpByHash = {
	hash: string
	otp: number
}
