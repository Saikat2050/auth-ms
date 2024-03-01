import {Manipulator, OrderDir, Range, Timestamp} from "./common"

export type VerificationTableData = {
	verificationId: number
	userId: number
	value: string
	otp: string
	isVerified: boolean
	status: boolean
} & Manipulator &
	Timestamp

export type VerificationDetails = {
	verificationId: number
	userId: number
	value: string
	otp: string
	isVerified: boolean
	status: boolean
}

export type CreateVerificationPayload = {
	userId: number
} & Partial<{
	value: string
	otp: string
	isVerified: boolean
}>

type FilterVerificationPayload = Partial<{
	verificationId?: number | number[]
	isVerified?: boolean
	createdAt?: string
	search?: string
}>

export type ListVerificationPayload = {
	filter?: FilterVerificationPayload
	range?: Range
	sort?: {
		orderBy?: keyof VerificationDetails
		orderDir?: OrderDir
	}
}

export type UpdateVerificationPayload = {
	verificationId: number
} & Partial<{
	value: string
	otp: string
	isVerified: boolean
}>

export type DeleteVerificationPayload = {
	verificationId: number[] | number
}
