import { NextFunction, Request, Response } from "express"

import helper from "../helpers/helper"
import { ApiResponse } from "../libs/ApiResponse"
import eventEmitter from "../libs/logging"
import configService from "../services/ConfigService"
import { Headers } from "../types/common"
import {
  ConfigDetails
} from "../types/configs"

class ConfigController {
  constructor() {
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

      const data = await configService.create(req.body, userId)

      // return response
      await response.accumulatedAPITransactionSucceed()
      return response.successResponse({
        message: `Config created successfully`,
        data,
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
      const {total, meta, data} = await configService.list(req.body)
  
      // result return
      return response.successResponse({
        message: `Config/s list`,
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
    const { userId }: Headers = req.headers
    try {
      await response.accumulatedAPITransactionBegin()
      const data: ConfigDetails = await configService.update(
        req.body,
        userId,
      )

      // return response
      await response.accumulatedAPITransactionSucceed()
      return response.successResponse({
        message: `Config update successfully.`,
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
      const { userId }: Headers = req.headers
      await response.accumulatedAPITransactionBegin()

      await configService.delete(req.body, userId)

      await response.accumulatedAPITransactionSucceed()
      return response.successResponse({
        success: true,
        message: `Config deleted successfully.`,
      })
    } catch (error) {
      await response.accumulatedAPITransactionFailed()
      eventEmitter.emit("logging", error?.toString())
      next(error)
    }
  }
}

export default new ConfigController()