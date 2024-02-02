import {
	Range,
	OrderDir,
	Manipulator,
	Timestamp,
} from "./common"
import {RoleDetails} from "./roles"

export type UserTableData = {
	userId: number
	roleId: number
	salutation: string
	firstName: string
	lastName: string
	email: string
	mobile: string
	gender: string
	dob: string
	secretHash: string
	address: string
	city: string
	state: string
	country: string
	postalCode: string
	status: boolean
} & Manipulator &
	Timestamp

export type UserShortDetails = {
	userId: number
	roleId: number
	salutation: string
	firstName: string
	lastName: string
	email: string
	mobile: string
	gender: string
	dob: string
	secretHash?: string
	address: string
	city: string
	state: string
	country: string
	postalCode: string
	status: boolean
}

export type UserDetails = {
	role: RoleDetails | null
} & UserShortDetails

type CreateUserApiSchema = {
	roleId: number
	firstName: string
} & Partial<{
	email: string
	mobile: string
	salutation: string
	lastName: string
	gender: string
	dob: string
}>

export type CreateUserApiPayload = CreateUserApiSchema[] | CreateUserApiSchema

export type CreateUserPayload = {
	roleId: number
	firstName: string
} & Partial<{
	email: string
	mobile: string
	salutation: string
	lastName: string
	gender: string
	dob: string
}>

type FilterUserPayload = Partial<{
	userId?: number | number[]
	firstName?: string
	lastName?: string
	roleId?: number | number[]
	dob?: string
	gender?: string
	search?: string
}>

export type ListUserPayload = {
	filter?: FilterUserPayload
	range?: Range
	sort?: {
		orderBy?: keyof UserShortDetails
		orderDir?: OrderDir
	}
}

export type UpdateUserPayload = {
	userId: number
} & Partial<{
	mobile: string
	email: string
	roleId: number
	salutation: string
	firstName: string
	lastName: string
	gender: string
	dob: string
}>

export type DeleteUserPayload = {
	userId: number[] | number
}
