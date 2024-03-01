import {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"
const Ajv = require("ajv")

// import schemas from "../../schema/cache.json"
const schemas = require("../../schema/cache.json")
import publicApi from "../schemas/publicRoutes.json"
import reservedApi from "../schemas/reservedRoutes.json"
import {ProvidersFactory} from "../libs/ProvidersFactory"

const ajv = new Ajv()

class Validator {
	super() {}

	public async schemaValidation(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		let reqUrl: string = req.url
		const typeModule: string[] = reqUrl.split("/")
		typeModule.pop()
		const schemaModulePath = Object.keys(schemas).find(
			(el) => el === typeModule.join("/")
		)

		if (schemaModulePath) {
			// @ts-ignore
			const schemaModule = schemas[schemaModulePath]
			// @ts-ignore
			const schema = schemaModule["schemas"]
			const apiSchema = Object.keys(schema).find((el) => el === reqUrl)
			if (apiSchema) {
				// @ts-ignore
				const valid = ajv.validate(schema[apiSchema], req.body)

				if (!valid) {
					next({
						statusCode: 403,
						code: `invalid_data`,
						message: ajv.errors[0].message
					})
				}
			}
		}
		next()
	}

	public async validateToken(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			const reqUrl: string = req.url
			const reqMethod: string = req.method
			for (let i = 0; i < publicApi.length; i++) {
				if (
					reqUrl === publicApi[i].apiPath &&
					reqMethod === publicApi[i].method
				) {
					return next()
				}
			}
			let token: string = req.headers.authorization as string
			if (!token) {
				return next({
					statusCode: 401,
					code: `invalid_token`,
					message: "Missing authorization header"
				})
			}

			// @ts-ignore
			token = token.split("Bearer").pop().trim()

			const decoded = await jwt.verify(
				token,
				process.env.JWT_SECRET_KEY as string
			)
			if (!decoded) {
				throw new Error("Invalid token")
			}
			const userId =
				typeof decoded === "string"
					? JSON.parse(decoded)?.userId ?? null
					: decoded?.userId ?? null
			if (!userId) {
				throw new Error("User does not exist")
			}

			const slug: string = req.headers.slug as string
			const redis = global.universalRedisClient
			const client = await redis.connectRedisClient()

			const slugName: string = `users_${slug}:${userId}`
			let userDetails = await client.hGetAll(slugName)

			// check for user details
			let userDetailsArr = Object.keys(userDetails)
			if (!userDetailsArr?.length) {
				userDetails = null
			}

			if (!userDetails) {
				const providersFactory = new ProvidersFactory()
				const {query, release} =
					await providersFactory.transaction(slug)

				const {rows} = await query(`
					SELECT *
					FROM "users" AS usr
					WHERE "deletedAt" IS NULL
					AND status IS TRUE
					AND userId = '${userId}'
				`)

				if (!rows?.length) {
					throw new Error("User does not exist")
				}

				await client.hSet(slugName, JSON.parse(rows[0]))

				userDetails = await client.hGetAll(slugName)
			}

			userDetails = JSON.stringify(userDetails, null, 2)
			userDetails = JSON.parse(userDetails)

			// userID
			req.headers.userId = userDetails.userId.toString()

			// roleID
			req.headers.roleId = userDetails.roleId.toString()

			next()
		} catch (err: any) {
			return next({
				statusCode: 401,
				code: `invalid_token`,
				message: err.message
			})
		}
	}

	public async roleValidation(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		let roleId: number | string | undefined = req.headers.roleId as string
		const slug: string = req.headers.slug as string
		let requiredSlug: string = ""
		const reqUrl: string = req.url
		const reqMethod: string = req.method
		let isPermissionRequired: boolean = false

		if ((roleId || "").toString().trim() !== "") {
			roleId = Number(roleId)
		}

		for (let i = 0; i < reservedApi.length; i++) {
			if (
				// @ts-ignore
				reqUrl === reservedApi[i]?.apiPath &&
				// @ts-ignore
				reqMethod === reservedApi[i]?.method
			) {
				isPermissionRequired = true
				// @ts-ignore
				requiredSlug = reservedApi[i]?.slug
			}
		}

		// check for permissions required
		if (!isPermissionRequired) {
			return next()
		}

		const redis = global.universalRedisClient
		const client = await redis.connectRedisClient()
		const slugName: string = `role_details_${slug}-${requiredSlug}:${roleId}`
		let roleDetails = await client.hGetAll(slugName)
		// check for role details
		let roleDetailsArr = Object.keys(roleDetails)
		if (!roleDetailsArr?.length) {
			roleDetails = null
		}

		if (!roleDetails) {
			const providersFactory = new ProvidersFactory()
			const {query, release} = await providersFactory.transaction(slug)

			const {rows} = await query(`
				SELECT *
				FROM "roles" AS rlo
				WHERE "deletedAt" IS NULL
				AND status IS TRUE
				AND slug = '${requiredSlug}'
				AND "roleId" = ${roleId}
			`)
			if (!rows?.length) {
				return next({
					statusCode: 403,
					message: "Forbidden request"
				})
			}

			await client.hSet(slugName, JSON.parse(rows[0]))

			roleDetails = await client.hGetAll(slugName)
		}

		roleDetails = JSON.stringify(roleDetails, null, 2)
		roleDetails = JSON.parse(roleDetails)

		if (!requiredSlug || !roleId || !roleDetails) {
			return next({
				statusCode: 403,
				message: "Forbidden request"
			})
		}

		return next()
	}
}

export default new Validator()
