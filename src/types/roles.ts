import {Range, OrderDir, Manipulator, Timestamp} from "./common"

export type RoleTableData = {
	roleId: number
	slug: string
	title: string
	status: boolean
} & Manipulator &
	Timestamp

export type RoleDetails = {
	roleId: number
	slug: string
	title: string
}

type CreateRoleSchema = {
	slug?: string
	title: string
}

export type CreateRolePayload = CreateRoleSchema[] | CreateRoleSchema

type FilterRolePayload = {
	roleId?: number | number[]
	slug?: string
	title?: string
	search?: string
}

export type ListRolePayload = {
	filter?: FilterRolePayload
	range?: Range
	sort?: {
		orderBy?: "roleId" | "title" | "slug"
		orderDir?: OrderDir
	}
}

export type UpdateRolePayload = {
	roleId: number
	slug?: string
	title?: string
}

export type DeleteRolePayload = {
	roleId: number[] | number
}
