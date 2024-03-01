import express, {Router} from "express"

import ConfigController from "../controllers/ConfigController"

//routes
export class ConfigRouter {
	public readonly router: Router
	constructor() {
		this.router = express.Router()
		this.router
			.post("/create", ConfigController.create)
			.post("/list", ConfigController.list)
			.post("/update", ConfigController.update)
			.post("/delete", ConfigController.delete)
	}
}
