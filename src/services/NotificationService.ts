import {isArray, uniq} from "lodash"

import {
	CreateNotificationServiceApiPayload,
	DeleteNotificationServicePayload,
	ListNotificationServicePayload,
	NotificationServiceDetails,
	UpdateNotificationServicePayload
} from "../types/notification-services"

import CommonModel from "../models/CommonModel"

import helper from "../helpers/helper"
import {BadRequestException} from "../libs/exceptions"

class NotificationServiceController {
	private notificationServiceModel
	private notificationServiceIdColumn: string = "notificationServiceId"

	constructor() {
		this.notificationServiceModel = new CommonModel(
			"users",
			this.notificationServiceIdColumn,
			[]
		)

		this.create = this.create.bind(this)
		this.list = this.list.bind(this)
		this.update = this.update.bind(this)
		this.delete = this.delete.bind(this)
	}

	public async create(
		inputData: CreateNotificationServiceApiPayload,
		userId: number
	) {
		try {
			// @ts-ignore
			inputData = isArray(inputData) ? inputData : [inputData]

			// configuration payload
			// @ts-ignore
			for (let i = 0; i < inputData.length; i++) {
				inputData[i].configuration =
					typeof inputData[i].configuration === "object"
						? JSON.stringify(inputData[i].configuration)
						: inputData[i].configuration
			}

			// create action
			const data: NotificationServiceDetails[] =
				await this.notificationServiceModel.bulkCreate(inputData)

			return data
		} catch (error) {
			throw error
		}
	}

	public async list(inputData: ListNotificationServicePayload) {
		try {
			const roleIds: number[] = []
			const {filter, range, sort}: ListNotificationServicePayload =
				await helper.listFunction(inputData)

			const [data, [{total}]]: [
				NotificationServiceDetails[],
				[{total: number}]
			] = await Promise.all([
				await this.notificationServiceModel.list(
					filter,
					range,
					sort,
					[]
				),

				// total
				await this.notificationServiceModel.list(
					filter,
					undefined,
					undefined,
					[
						`COUNT("${this.notificationServiceIdColumn}")::integer AS total`
					],
					true
				)
			])

			// total pages
			let pageSize: number = range?.pageSize ?? 100
			pageSize = pageSize === 0 ? 100 : pageSize
			const pageCount: number = Math.ceil(total / pageSize)

			// result return
			return {
				total,
				meta: {
					page: range?.page ?? 1,
					pageSize,
					pageCount
				},
				data
			}
		} catch (error) {
			throw error
		}
	}

	public async update(
		inputData: UpdateNotificationServicePayload,
		userId: number
	) {
		try {
			// check if role exist
			const [userDetails]: NotificationServiceDetails[] =
				await this.notificationServiceModel.list({
					notificationServiceId: inputData.notificationServiceId
				})
			if (!userDetails) {
				throw new BadRequestException(
					"Notification service not found.",
					"not_found"
				)
			}

			const data: NotificationServiceDetails[] =
				await this.notificationServiceModel.update(
					inputData,
					inputData.notificationServiceId,
					userId
				)

			return data
		} catch (error) {
			throw error
		}
	}

	public async delete(
		inputData: DeleteNotificationServicePayload,
		userId: number
	) {
		try {
			const notificationServiceIds: number[] = isArray(
				inputData.notificationServiceId
			)
				? uniq(inputData.notificationServiceId)
				: [inputData.notificationServiceId]

			// check if role exist
			const notificationServiceDetails: NotificationServiceDetails[] =
				await this.notificationServiceModel.list({
					notificationServiceId: notificationServiceIds
				})
			if (
				!notificationServiceDetails?.length ||
				notificationServiceDetails.length <
					notificationServiceIds.length
			) {
				throw new BadRequestException(
					"Notification service not found.",
					"not_found"
				)
			}

			// delete
			await this.notificationServiceModel.softDelete(
				notificationServiceIds,
				userId
			)

			return true
		} catch (error) {
			throw error
		}
	}
}

export default new NotificationServiceController()
