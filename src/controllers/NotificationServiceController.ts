import {Request, Response, NextFunction} from "express"
import {isArray, uniq} from "lodash"

import {Headers, Roles} from "../types/common"
import {
	NotificationServiceTableData,
	CreateNotificationServicePayload,
	ListNotificationServicePayload,
	UpdateNotificationServicePayload,
	NotificationServiceDetails,
	DeleteNotificationServicePayload
} from "../types/notification-services"

import CommonModel from "../models/CommonModel"

import {BadRequestException, ForbiddenException} from "../libs/exceptions"
import eventEmitter from "../libs/logging"
import {ApiResponse} from "../libs/ApiResponse"
import helper from "../helpers/helper"
import NotificationService from "../services/NotificationService"

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

	public async create(req: Request, res: Response, next: NextFunction) {
		const response = new ApiResponse(res)
		const {userId}: Headers = req.headers
		try {
			await response.accumulatedAPITransactionBegin()

			const data = await NotificationService.create(req.body, userId)

			// return response
			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
				message: `Notification service created successfully`,
				data
			})
		} catch (error) {
			await response.accumulatedAPITransactionFailed()
			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	public async list(req: Request, res: Response, next: NextFunction) {
		const response = new ApiResponse(res)
		const {userId}: Headers = req.headers
		try {
			const {total, meta, data} = await NotificationService.list(req.body)

			// result return
			return response.successResponse({
				message: `Notification service/s list.`,
				total,
				meta,
				data
			})
		} catch (error) {
			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const response = new ApiResponse(res)
			const {userId}: Headers = req.headers

			const inputData: UpdateNotificationServicePayload = req.body

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

			return response.successResponse({
				message: `Notification service updated successfully.`,
				data
			})
		} catch (error) {
			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const response = new ApiResponse(res)
			const {userId, roleId}: Headers = req.headers

			const notificationServiceIds: number[] = isArray(
				req.body.notificationServiceId
			)
				? uniq(req.body.notificationServiceId)
				: [req.body.notificationServiceId]

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

			return response.successResponse({
				message: `Notification service deleted successfully.`
			})
		} catch (error) {
			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}
}

export default new NotificationServiceController()
