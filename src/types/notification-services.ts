import {Range, OrderDir, Manipulator, Timestamp} from "./common"

type Configuration = {
	to: string[]
	cc?: string[]
	bcc?: string[]
	subject: string
	body: string
	from: string
	publicKey: string
	privateKey: string
}

export type NotificationServiceTableData = {
	notificationServiceId: number
	service: string
	serviceType: string
	host: string
	port: string
	encryption: string
	configuration: Configuration
	isActive: boolean
	status: boolean
} & Manipulator &
	Timestamp

export type NotificationServiceDetails = {
	notificationServiceId: number
	service: string
	serviceType: string
	host: string
	port: string
	encryption: string
	configuration: Configuration
	isActive: boolean
	status: boolean
}

export type CreateNotificationServicePayload = {
	service: string
	serviceType: string
	host: string
	port: string
	encryption: string
	configuration: Configuration
	isActive: boolean
}

type CreateNotificationServiceApiSchema = {
	service: string
	serviceType: string
	host: string
	port: string
	encryption: string
	configuration: string
	isActive: boolean
}

export type CreateNotificationServiceApiPayload =
	| CreateNotificationServiceApiSchema[]
	| CreateNotificationServiceApiSchema

type FilterNotificationServicePayload = Partial<{
	notificationServiceId?: number | number[]
	service?: string
	serviceType?: string
	host?: string
	port?: string
	encryption?: string
	isActive?: boolean
	search?: string
}>

export type ListNotificationServicePayload = {
	filter?: FilterNotificationServicePayload
	range?: Range
	sort?: {
		orderBy?: keyof NotificationServiceDetails
		orderDir?: OrderDir
	}
}

export type UpdateNotificationServicePayload = {
	notificationServiceId: number
} & Partial<{
	service: string
	serviceType: string
	host: string
	port: string
	encryption: string
	configuration: string
	isActive: boolean
}>

export type DeleteNotificationServicePayload = {
	notificationServiceId: number[] | number
}
