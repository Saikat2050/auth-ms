import {Redis} from "../libs/Redis"
import eventEmitter from "../libs/logging"

export async function connectGlobalRedisClient() {
	try {
		const redis = new Redis()
		const redisClient = await redis.connectRedisClient()
		eventEmitter.emit("logging", `Connected to redis server.`)

		global.universalRedisClient = redisClient
	} catch (err: any) {
		eventEmitter.emit("logging", `Redis connection failed.\n${err.message}`)
		process.exit()
	}
}
