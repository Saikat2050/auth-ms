import {createClient} from "redis"
import eventEmitter from "../libs/logging"
// import {readFileSync} from "fs"

let redisClientConfig: any = {
	username: process.env.REDIS_SERVER_USERNAME as string,
	password: process.env.REDIS_SERVER_PASSWORD as string,
	socket: {
		host: process.env.REDIS_SERVER_HOST as string,
		port: Number(process.env.REDIS_SERVER_PORT),
		tls: false
		// key: readFileSync('./redis_user_private.key'),
		// cert: readFileSync('./redis_user.crt'),
		// ca: [readFileSync('./redis_ca.pem')]
	}
}

export class Redis {
	public client
	constructor() {}

	public async connectRedisClient() {
		try {
			if (!this.client) {
				const redisClientConfigArr = Object.keys(redisClientConfig)
				if (!redisClientConfigArr?.length) {
					redisClientConfig = undefined
				}

				this.client = createClient(redisClientConfig)

				this.client.on("error", (err) => {
					eventEmitter.emit("logging", err.toString())
					throw err
				})

				this.client = await this.client.connect()
			}

			return this.client
		} catch (error) {
			eventEmitter.emit("logging", error?.toString())
			process.exit()
		}
	}
}