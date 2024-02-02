import { NextFunction, Request, Response } from "express"

import { Headers } from "../types/common"
import {
	CreateRolePayload,
	UpdateRolePayload
} from "../types/roles"

import CommonModel from "../models/CommonModel"

import { ApiResponse } from "../libs/ApiResponse"
import eventEmitter from "../libs/logging"
import { default as RoleService, default as roleService } from "../services/RoleService"

class RoleController {
	private roleModel
	private roleIdColumn: string = "roleId"

	constructor() {
		this.roleModel = new CommonModel("roles", this.roleIdColumn, ["name"])

		this.create = this.create.bind(this)
		this.list = this.list.bind(this)
		this.update = this.update.bind(this)
		this.delete = this.delete.bind(this)
	}

	public async create(req: Request, res: Response, next: NextFunction) {
		const response = new ApiResponse(res)
		const { userId }: Headers = req.headers
		try {
			await response.accumulatedAPITransactionBegin()
		  const data: CreateRolePayload = await roleService.create(
			req.body,
			userId,
		  )
	
		  // return response
			await response.accumulatedAPITransactionSucceed()
		  return response.successResponse({
			message: `Role created successfully.`,
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

		try {
			const {total, meta, data} = await roleService.list(req.body)
  
			// result return
			return response.successResponse({
			  message: `Role/s list.`,
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
			const data: UpdateRolePayload = await roleService.update(
			  req.body,
			  userId,
			)
	  
			// return response
			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
			  message: `Role updated successfully.`,
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
		const {userId}: Headers = req.headers
		try {
			const { userId }: Headers = req.headers
			await response.accumulatedAPITransactionBegin()
	  
			await RoleService.delete(req.body, userId)
	  
			await response.accumulatedAPITransactionSucceed()
			return response.successResponse({
			  success: true,
			  message: `Role/s deleted successfully.`,
			})
		  } catch (error) {
			await response.accumulatedAPITransactionFailed()
			eventEmitter.emit("logging", error?.toString())
			next(error)
		  }
	}
}

export default new RoleController()
