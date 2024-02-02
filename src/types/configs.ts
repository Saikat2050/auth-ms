import {Range, OrderDir, Manipulator, Timestamp} from "./common"

export type ConfigTableData = {
	configId: number
	title: string
    description: string
    slug: string
    config: string
	status: boolean
} & Manipulator &
	Timestamp

export type ConfigDetails = {
	configId: number
	title: string
    description: string
    slug: string
    config: string
}

type CreateConfigSchema = {
	title: string
    description?: string
    slug?: string
    config: string
}

export type CreateConfigPayload = CreateConfigSchema[] | CreateConfigSchema

type FilterConfigPayload = {
	configId?: number | number[]
	slug?: string
	title?: string
	search?: string
}

export type ListConfigPayload = {
	filter?: FilterConfigPayload
	range?: Range
	sort?: {
		orderBy?: "configId" | "title" | "slug"
		orderDir?: OrderDir
	}
}

export type UpdateConfigPayload = {
	configId: number
	title?: string
    description?: string
    slug?: string
    config?: string
}

export type DeleteConfigPayload = {
	configId: number[] | number
}
