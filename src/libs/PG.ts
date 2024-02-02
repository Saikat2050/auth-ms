import {Pool, PoolConfig, QueryConfig, QueryResult} from "pg"
const pg = require("pg")

export class PG {
	private pool: Pool

	constructor(private poolConfig: PoolConfig) {
		// this pool class used the db configuration
		this.pool = new Pool(poolConfig)

		const types = pg.types
		types.setTypeParser(1114, function (stringValue: string) {
			return stringValue
		})
	}

	public async getClient(): Promise<any> {
		const client = await this.pool.connect()

		return client
	}

	public getPool(): Pool {
		return this.pool
	}

	public async query(
		sql: string | QueryConfig,
		values?: any[]
	): Promise<QueryResult> {
		let s = sql as string
		if (values) {
			for (let i = 0; i < values.length; i++) {
				s = s.replace(`$${i + 1}`, values[i])
			}
		}

		let res = await this.pool.query(sql, values)
		return res
	}

	public static decomposeObjectForArrays(
		object: any,
		ignoreFields: string[] = []
	): {keys: string[]; values: any[]; dollars: string[]; pairs: string[]} {
		let keys: string[] = []
		let values: any[] = []
		for (let key in object) {
			if (ignoreFields.indexOf(key) == -1) {
				let param = '"' + key + '"'
				keys.push(param)
				values.push(object[key])
			}
		}

		let dollars: string[] = []
		let pairs: string[] = []
		for (let i = 0; i < keys.length; i++) {
			dollars.push(`$${i + 1}`)
			pairs.push(`${keys[i]}=$${i + 1}`)
		}

		pairs.push('"updatedAt" =' + "CURRENT_TIMESTAMP")

		return {keys, values, dollars, pairs}
	}

	public static escape(str: string): string {
		return `'${str.replace(/'/g, "''")}'`
	}
}
