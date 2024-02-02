import express, {Request, Response, NextFunction} from "express"
import axios, {AxiosRequestConfig} from "axios"
import eventEmitter from "../libs/logging"
import {ApiResponse} from "../libs/ApiResponse"

class ProxyMiddleware {
	constructor() {}
	// proxy middleware
	public async ProxyMiddleware(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const envVariableName: string | undefined = req.headers.slug
			?.toString()
			.trim()
			.toUpperCase()

		const proxyRoute: string | undefined = process.env[`${envVariableName}`]

		if ((proxyRoute || "").trim() === "") {
			eventEmitter.emit("logging", "Invalid host name")
			process.exit()
		}

		const requestObject: AxiosRequestConfig = {
			url: req.originalUrl as string,
			method: req.method as string,
			baseURL: proxyRoute as string,
			headers: req.headers,
			params: req.params,
			data: req.body,
			timeout: 10000,
			responseType: "json"
		}

		const response = new ApiResponse(res)
		try {
			const {data} = await axios(requestObject)

			return response.successResponse(data)
		} catch (err: any) {
			if (err.response) {
				return response.errorResponse({
					...err.response.data,
					statusCode: err.response.status
				})
			}
			return next()
		}
	}
}

export default new ProxyMiddleware()