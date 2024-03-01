import express from "express"

import {
	AuthRouter,
	ConfigRouter,
	NotificationServiceRouter,
	RoleRouter,
	UserRouter
} from "."

const router = express.Router()

// auth routes
router.use("/auth", new AuthRouter().router)
router.use("/roles", new RoleRouter().router)
router.use("/configs", new ConfigRouter().router)
router.use("/users", new UserRouter().router)
router.use("/notification-services", new NotificationServiceRouter().router)

export default router
