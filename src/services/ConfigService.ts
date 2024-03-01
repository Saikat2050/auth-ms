import { isArray, uniq } from "lodash"

import {
  ConfigDetails,
  CreateConfigPayload,
  DeleteConfigPayload,
  ListConfigPayload,
  UpdateConfigPayload
} from "../types/configs"

import CommonModel from "../models/CommonModel"

import helper, { createSlug } from "../helpers/helper"
import { BadRequestException } from "../libs/exceptions"

class ConfigService {
  private configModel
  private configIdColumn: string = "configId"

  constructor() {
    this.configModel = new CommonModel("configs", this.configIdColumn, [])

    this.create = this.create.bind(this)
    this.list = this.list.bind(this)
    this.update = this.update.bind(this)
    this.delete = this.delete.bind(this)
  }

  public async create(inputData: CreateConfigPayload, userId: number) {
    try {
      //@ts-ignore accept array and non array inputs
      inputData = isArray(inputData) ? inputData : [inputData]

      const title: string[] = inputData
      // @ts-expect-error for comparing title 
        .map((el) => el.title)
        .filter((el) => el)

      const [configExists, [configData]] :[ConfigDetails[], [ConfigDetails]] = await Promise.all([
        this.configModel.list({
          title,
        }),
        this.configModel.list({})
      ])

      if (configExists.length) {
        throw new BadRequestException(
          `Config/s already exists - ${configExists
            .map((el) => el.title)
            .filter((el) => el)}.`,
        )
      }

      // @ts-expect-error
      for (const configData of inputData) {
        if (!configData.slug) {
          configData.slug = await createSlug(
            configExists,
            "slug",
            configData.title,
          )
        }
        configData.config =
          typeof configData.config === "object"
            ? JSON.stringify(configData.config)
            : configData.config
      }

      // create action
      const data: ConfigDetails[] = await this.configModel.bulkCreate(
        inputData,
        userId,
      )

      return data
    } catch (error) {
      throw error
    }
  }

  public async list(inputData: ListConfigPayload) {
    try {
      const { filter, range, sort }: ListConfigPayload =
        await helper.listFunction(inputData)

      const [data, [{ total }]]: [ConfigDetails[], [{ total: number }]] =
        await Promise.all([
          this.configModel.list(filter, range, sort),

          // total
          this.configModel.list(
            filter,
            undefined,
            undefined,
            [`COUNT("${this.configIdColumn}")::integer AS total`],
            true,
          ),
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
          pageCount,
        },
        data
      }
    } catch (error) {
      throw error
    }
  }

  public async update(inputData: UpdateConfigPayload, userId: number) {
    try {
      // check if config exist
      const [configDetails]: [ConfigDetails] = await this.configModel.list({
        configId: inputData.configId,
      })
      if (!configDetails) {
        throw new BadRequestException("Config not found.", "not_found")
      }

      if (inputData.title) {
        const configExists: ConfigDetails[] = await this.configModel.list({
          title: inputData.title,
        })

        if (configExists.length) {
          throw new BadRequestException(
            `Config already exist/s - ${configExists
              .map((el) => el.title)
              .filter((el) => el)}.`,
          )
        }
      }

      const [data]: [ConfigDetails] = await this.configModel.update(
        inputData,
        inputData.configId,
        userId,
      )

      return data
    } catch (error) {
      throw error
    }
  }

  public async delete(inputData: DeleteConfigPayload, userId: number) {
    try {
      const configIds: number[] = isArray(inputData.configId)
        ? uniq(inputData.configId)
        : [inputData.configId]

      // check if config exist
      const configDetails: ConfigDetails[] = await this.configModel.list({
        configId: configIds,
      })
      if (!configDetails?.length || configDetails.length < configIds.length) {
        throw new BadRequestException("Config not found.", "not_found")
      }

      // delete
      await this.configModel.softDelete(configIds, userId)

      return true
    } catch (error) {
      throw error
    }
  }
}

export default new ConfigService()