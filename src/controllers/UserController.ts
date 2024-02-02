import { NextFunction, Request, Response } from "express"

import { Headers } from "../types/common"
import {
	CreateUserPayload,
	UpdateUserPayload
} from "../types/users"

import CommonModel from "../models/CommonModel"

import { ApiResponse } from "../libs/ApiResponse"
import eventEmitter from "../libs/logging"
import { default as UserService, default as userService } from "../services/UserService"

class UserController {
	private userModel
	private userIdColumn: string = "userId"

	constructor() {
		this.userModel = new CommonModel("users", this.userIdColumn, ["name"])

		// this.create = this.create.bind(this)
		this.list = this.list.bind(this)
		this.update = this.update.bind(this)
		this.delete = this.delete.bind(this)
	}

	// public async create(req: Request, res: Response, next: NextFunction) {
	// 	const response = new ApiResponse(res)
	// 	const { userId }: Headers = req.headers
	// 	try {
	// 		await response.accumulatedAPITransactionBegin()
	// 	  const data: CreateUserPayload[] = await userService.create(
	// 		req.body,
	// 		userId,
	// 	  )
	
	// 	  // return response
	// 		await response.accumulatedAPITransactionSucceed()
	// 	  return response.successResponse({
	// 		message: `User created successfully.`,
	// 		data
	// 	  })
	// 	} catch (error) {
	// 		await response.accumulatedAPITransactionFailed()
	// 		eventEmitter.emit("logging", error?.toString())
	// 		next(error)
	// 	}
	// }

	public async list(req: Request, res: Response, next: NextFunction) {
		const response = new ApiResponse(res)

		try {
			const {total, meta, data} = await userService.list(req.body)
  
			// result return
			return response.successResponse({
			  message: `User/s list.`,
			  total,
			  meta,
			  data,
			})
		} catch (error) {
			eventEmitter.emit("logging", error?.toString())
			next(error)
		}
	}

	public async update(req: Request, res: Response, next: NextFunction) {
		const response = new ApiResponse(res)
		const {userId}: Headers = req.headers
		try {
			await response.accumulatedAPITransactionBegin()
			const data: UpdateUserPayload = await userService.update(
			  req.body,
			  userId,
			)
	  
			// return response
			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
			  message: `User updated successfully.`,
			  data,
			})
		  } catch (error) {
			await response.accumulatedAPITransactionFailed()
			eventEmitter.emit("logging", error?.toString())
			next(error)
		  }
	}

	public async delete(req: Request, res: Response, next: NextFunction) {
		
        const response = new ApiResponse(res)
		try {
            // fetch userId from token
			const { userId }: Headers = req.headers
            /* transaction has started */ 
			await response.accumulatedAPITransactionBegin()
            
			await UserService.delete(req.body, userId)

            /* transaction made it to success */
			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
			  success: true,
			  message: `User/s deleted successfully.`,
			})
		  } catch (error) {
            /* transaction made failed */
			await response.accumulatedAPITransactionFailed()
			eventEmitter.emit("logging", error?.toString())
			next(error)
		  }
	}
}

export default new UserController()
