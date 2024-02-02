import moment from "moment"

import {ProvidersFactory} from "../libs/ProvidersFactory"

export default class CustomModel {
	private providersFactory
	private query
	private release
	constructor() {
		this.providersFactory = new ProvidersFactory()
		this.getTransactionInstances()
	}

	getTransactionInstances = async () => {
		const {query, release} = await this.providersFactory.transaction()

		this.query = query
		this.release = release
	}

	accumulatedModelTransactionBegin = async () => {
		this.query("BEGIN")
		this.release()
	}

	accumulatedAPITransactionSucceed = async () => {
		this.query("COMMIT")
		this.release()
	}

	accumulatedAPITransactionFailed = async () => {
		this.query("ROLLBACK")
		this.release()
	}

	rawQuery = async (sql: string) => {
		const {rows} = await this.query(sql)

		this.release()
		return rows
	}
}
