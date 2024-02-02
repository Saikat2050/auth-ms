import {Request, Response, NextFunction} from "express"
import eventEmitter from "../libs/logging"
import { ProvidersFactory } from "../libs/ProvidersFactory"


class SlugValidation {
	constructor() {}

	public async validateSlug(req: Request, res: Response, next: NextFunction) {
		try {
			const slug: string = (req.headers.slug ?? "").toString().trim()

			if (slug === "") {
				return next({
					statusCode: 401,
					code: `unauthorize`,
					message: "Missing slug header"
				})
			}

			const redis = global.universalRedisClient
			const client = await redis.connectRedisClient()

			let serverConfig = await client.hGetAll(`api_server_config_${slug}`)

			// check for server configuration
			let serverConfigArr = Object.keys(serverConfig)
			if (!serverConfigArr?.length) {
				serverConfig = null
			}
			if (!serverConfig) {
				const providersFactory = new ProvidersFactory()
				const {query, release} = await providersFactory.transaction()
				
				const {rows} = await query(`
					SELECT *
					FROM "configs" AS cfg
					WHERE "deletedAt" IS NULL
					AND status IS TRUE
					AND slug = '${slug}'
				`)

				if (!rows?.length) {
					return next({
						statusCode: 401,
						code: `unauthorize`,
						message: "Invalid slug header"
					})
				} else {
					const configData =
					typeof rows[0] === "string"
							? JSON.parse(rows[0])
							: rows[0]

					await client.hSet(`api_server_config_${slug}`, configData)

					serverConfig = await client.hGetAll(`api_server_config_${slug}`)
				}
			}

			serverConfig = JSON.stringify(serverConfig, null, 2)

			req.headers.slug = JSON.parse(serverConfig)?.slug

			return next()
		} catch (error) {
			eventEmitter.emit("logging", error?.toString())
			next({
				statusCode: 500,
				code: `internal_server_error`,
				message: error?.toString()
			})
			// process.exit()
		}
	}
}

export default new SlugValidation()
