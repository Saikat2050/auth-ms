import { isArray, uniq } from "lodash"

import {
    CreateUserPayload,
    DeleteUserPayload,
    ListUserPayload,
    UserDetails,
    UpdateUserPayload,
	CreateUserApiPayload
} from "../types/users"

import CommonModel from "../models/CommonModel"

import helper, { createSlug } from "../helpers/helper"
import { BadRequestException } from "../libs/exceptions"

class UserService {
	private userModel
	private userIdColumn: string = "userId"

	constructor() {
		this.userModel = new CommonModel("users", this.userIdColumn, ["name"])

		// this.create = this.create.bind(this)
		this.list = this.list.bind(this)
		this.update = this.update.bind(this)
		this.delete = this.delete.bind(this)
	}

	// public async create(inputData: CreateUserApiPayload, userId: number) {
	// 	try {
	// 		inputData = isArray(inputData) ? inputData : [inputData]

	// 		const [userExists, users]: [UserDetails[], UserDetails[]] =
	// 			await Promise.all([
	// 				this.userModel.list({
	// 					email: inputData.email,
    //                     mobile: inputData.mobile
	// 				}),
	// 				this.userModel.list({})
	// 			])

	// 		if (userExists.length) {
	// 			throw new BadRequestException(
	// 				`User/s already exists - ${userExists
	// 					.map((el) => el.email)
	// 					.filter((el) => el)}.`
	// 			)
	// 		}

	// 		// create action
	// 		const data: UserDetails[] = await this.userModel.bulkCreate(
	// 			inputData,
	// 			userId
	// 		)

	// 		return data
	// 	} catch (error) {
	// 		throw error
	// 	}
	// }

	public async list(inputData: ListUserPayload) {
		try {
			const {filter, range, sort}: ListUserPayload = await helper.listFunction(inputData)

			const [data, [{total}]]: [UserDetails[], [{total: number}]] =
				await Promise.all([
					await this.userModel.list(filter, range, sort),

					// total
					await this.userModel.list(
						filter,
						undefined,
						undefined,
						[`COUNT("${this.userIdColumn}")::integer AS total`],
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

	public async update(inputData: UpdateUserPayload, userId: number) {
		try {
			// check if user exist
			const [userDetails]: UserDetails[] = await this.userModel.list({
				userId: inputData.userId
			})
			if (!userDetails) {
				throw new BadRequestException("User not found.", "not_found")
			}

			const userExists: UserDetails[] = await this.userModel.list({
				email: inputData.email
			})
			if (userExists.length) {
				throw new BadRequestException(
					`User already exists - ${userExists
						.map((el) => el.email)
						.filter((el) => el)}.`
				)
			}
		
			const [data]: [UpdateUserPayload] = await this.userModel.update(
				inputData,
				inputData.userId,
				userId
			)

			return data
		} catch (error) {
			throw error
		}
	}

	public async delete(inputData: DeleteUserPayload, userId: number) {
		try {
			const userIds: number[] = isArray(inputData.userId)
				? uniq(inputData.userId)
				: [inputData.userId]

			// check if user exist
			const userDetails: UserDetails[] = await this.userModel.list({
				userId: userIds
			})
			if (!userDetails?.length || userDetails.length < userIds.length) {
				throw new BadRequestException("User not found", "not_found")
			}

			// delete
			await this.userModel.softDelete(userIds, userId)

			return true
		} catch (error) {
			throw error
		}
	}
}

export default new UserService()
