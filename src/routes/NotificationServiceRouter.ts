import express, {Router} from "express"

import NotificationServiceController from "../controllers/NotificationServiceController"

//routes
export class NotificationServiceRouter {
	public readonly router: Router
	constructor() {
		this.router = express.Router()
		this.router
			.post("/create", NotificationServiceController.create)
			.post("/list", NotificationServiceController.list)
			.post("/update", NotificationServiceController.update)
			.post("/delete", NotificationServiceController.delete)
			
	}
}
