export type OrderDir = "asc" | "desc" | "ASC" | "DESC"

export type Range = Partial<{
	page: number
	pageSize: number
}>

export type Sort = Partial<{
	orderBy: string
	orderDir: OrderDir
}>

export type Timestamp = {
	createdAt: string
	updatedAt: string
	deletedAt: string
}

export type Manipulator = {
	createdBy: string
	updatedBy: string
	deletedBy: string
}

export type Error = {
	message: string
	status?: number
	code?: string
	stack?: string
}

export type Headers = any & {
	clientId: number
	userId: number
	roleId: number
}

export type UrlSchema =
	| {
			apiPath: string
			method: string
	  }
	| undefined

export enum Roles {
	SUPER_ADMIN = "super-admin",
	ADMIN = "admin"
}
