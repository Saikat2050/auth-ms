import { isArray, uniq } from "lodash"

import {
    CreateRolePayload,
    DeleteRolePayload,
    ListRolePayload,
    RoleDetails,
    UpdateRolePayload
} from "../types/roles"

import CommonModel from "../models/CommonModel"

import helper, { createSlug } from "../helpers/helper"
import { BadRequestException } from "../libs/exceptions"

class RoleService {
	private roleModel
	private roleIdColumn: string = "roleId"

	constructor() {
		this.roleModel = new CommonModel("roles", this.roleIdColumn, ["name"])

		this.create = this.create.bind(this)
		this.list = this.list.bind(this)
		this.update = this.update.bind(this)
		this.delete = this.delete.bind(this)
	}

	public async create(inputData: CreateRolePayload, userId: number) {
		try {
			inputData = isArray(inputData) ? inputData : [inputData]
            //@ts-ignore 
			const title: string[] = inputData.map((el) => el.title).filter((el) => el)

			const [roleExists, roles]: [RoleDetails[], RoleDetails[]] =
				await Promise.all([
					this.roleModel.list({
						title
					}),
					this.roleModel.list({})
				])

			if (roleExists.length) {
				throw new BadRequestException(
					`Role/s already exists - ${roleExists
						.map((el) => el.title)
						.filter((el) => el)}.`
				)
			}

			// @ts-ignore
			for (let roleData of inputData) {
				if (!roleData.slug) {
					roleData.slug = await createSlug(roles, "slug", roleData.title)
				}
			}

			// create action
			const data: RoleDetails[] = await this.roleModel.bulkCreate(
				inputData,
				userId
			)

			return data
		} catch (error) {
			throw error
		}
	}

	public async list(inputData: ListRolePayload) {
		try {
			const {filter, range, sort}: ListRolePayload = await helper.listFunction(inputData)

			const [data, [{total}]]: [RoleDetails[], [{total: number}]] =
				await Promise.all([
					await this.roleModel.list(filter, range, sort),

					// total
					await this.roleModel.list(
						filter,
						undefined,
						undefined,
						[`COUNT("${this.roleIdColumn}")::integer AS total`],
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

	public async update(inputData: UpdateRolePayload, userId: number) {
		try {
			// check if role exist
			const [roleDetails]: RoleDetails[] = await this.roleModel.list({
				roleId: inputData.roleId
			})
			if (!roleDetails) {
				throw new BadRequestException("Role not found.", "not_found")
			}

			if (inputData.title) {
				const roleExists: RoleDetails[] = await this.roleModel.list({
					title: inputData.title
				})

				if (roleExists.length) {
					throw new BadRequestException(
						`Role already exists - ${roleExists
							.map((el) => el.title)
							.filter((el) => el)}.`
					)
				}
			}

			const [data]: [UpdateRolePayload] = await this.roleModel.update(
				inputData,
				inputData.roleId,
				userId
			)

			return data
		} catch (error) {
			throw error
		}
	}

	public async delete(inputData: DeleteRolePayload, userId: number) {
		try {
			const roleIds: number[] = isArray(inputData.roleId)
				? uniq(inputData.roleId)
				: [inputData.roleId]

			// check if role exist
			const roleDetails: RoleDetails[] = await this.roleModel.list({
				roleId: roleIds
			})
			if (!roleDetails?.length || roleDetails.length < roleIds.length) {
				throw new BadRequestException("Role not found", "not_found")
			}

			// delete
			await this.roleModel.softDelete(roleIds, userId)

			return true
		} catch (error) {
			throw error
		}
	}
}

export default new RoleService()
