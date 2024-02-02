import {Request, Response, NextFunction} from "express"
import {ProvidersFactory} from "../libs/ProvidersFactory"

export class ApiResponse {
	private res
	constructor(response: Response) {
		this.res = response
	}

	public async accumulatedAPITransactionBegin() {
		const providersFactory = new ProvidersFactory()
		const {query, release} = await providersFactory.transaction()

		query("BEGIN")
		release()
	}

	public async accumulatedAPITransactionSucceed() {
		const providersFactory = new ProvidersFactory()
		const {query, release} = await providersFactory.transaction()

		query("COMMIT")
		release()
	}

	public async accumulatedAPITransactionFailed() {
		const providersFactory = new ProvidersFactory()
		const {query, release} = await providersFactory.transaction()

		query("ROLLBACK")
		release()
	}

	public async successResponse(data: any) {
		const statusCode: number = data.statusCode ?? 200

		return this.res.status(statusCode).json({
			success: true,
			status: statusCode,
			...data
		})
	}

	public async errorResponse(data: any) {
		const statusCode: number = data.statusCode ?? 422

		if (!data.errorCode) {
			switch (statusCode) {
				case 400:
					data.errorCode = "unexpected_error"
					break
				case 401:
					data.errorCode = "unauthorized"
					break
				case 403:
					data.errorCode = "not_enough_permissions"
					break
				case 404:
					data.errorCode = "not_found"
					break
				default:
					data.errorCode = "internal_server_error"
					break
			}
		}

		return this.res.status(statusCode).json({
			success: false,
			status: statusCode,
			message: data?.message,
			code: data.errorCode
		})
	}
}
