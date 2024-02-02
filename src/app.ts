require("dotenv").config()
import express, {Application} from "express"
import cors from "cors"
import path from "path"
import bodyParser from "body-parser"
import {createStream} from "rotating-file-stream"
import helmet from "helmet"
import compression from "compression"
import moment from "moment"
import fs from "fs"
import morgan from "morgan"

/* Routes */
import routes from "./routes/MainRouter"

/* libs */
import eventEmitter from "./libs/logging"
import {migrator} from "./libs/migrator"
import {generateSchema} from "./libs/schemaGenerator"
import Validator from "./middlewares/Validator"
import {connectGlobalRedisClient} from "./helpers/redisServer"

/* Middlewares */
import ApiMiddlewares from "./middlewares/ApiMiddlewares"
import SlugValidation from "./middlewares/SlugValidation"
import ProxyMiddlewares from "./middlewares/ProxyMiddlewares"

const port: number = parseInt(process.env.SERVER_PORT as string) || 5002
const app: Application = express()

// Environments
const SUPPORTED_ENVS = ["development", "staging", "production"]

if (
	!process.env.ENVIRONMENT ||
	!SUPPORTED_ENVS.includes(process.env.ENVIRONMENT)
) {
	const supported = SUPPORTED_ENVS.map((env) => JSON.stringify(env)).join(", ")

	eventEmitter.emit(
		"logging",
		`ENVIRONMENT=${process.env.ENVIRONMENT} is not supported. Supported values: ${supported}`
	)
	process.exit()
}

// common logs
const todayDate = moment().format("YYYY-MM-DD")
const logFileName = `log_${todayDate}.log`

// access logs directory
const accessLogDirectory = path.join(__dirname, "../public/logs/accessLogs")
fs.existsSync(accessLogDirectory) ||
	fs.mkdirSync(accessLogDirectory, {recursive: true})

const accessLogStream = createStream(logFileName, {
	interval: "1d", // rotate daily
	path: accessLogDirectory
})

// access logs
app.use(
	morgan("common", {
		stream: accessLogStream
	})
)

// error logs directory
const errorLogDirectory = path.join(__dirname, "../public/logs/errorLogs")
fs.existsSync(errorLogDirectory) ||
	fs.mkdirSync(errorLogDirectory, {recursive: true})

const errorLogStream = createStream(logFileName, {
	interval: "1d", // rotate daily
	path: errorLogDirectory
})

// error logs
app.use(
	morgan("dev", {
		skip: function (req, res) {
			return res.statusCode < 400
		},
		stream: errorLogStream
	})
)

// Access-Control-Allow-Origin
app.use(ApiMiddlewares.accessControl)

// utils and heplers
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, "../", "public")))
app.use(compression())
app.use(ApiMiddlewares.optionsMiddleware)

// use helmet
app.use(helmet.contentSecurityPolicy())
app.use(helmet.crossOriginEmbedderPolicy())
app.use(helmet.crossOriginOpenerPolicy())
app.use(helmet.crossOriginResourcePolicy())
app.use(helmet.dnsPrefetchControl())
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
app.use(helmet.hsts())
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())
app.use(helmet.originAgentCluster())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.referrerPolicy())
app.use(helmet.xssFilter())

app.use(SlugValidation.validateSlug)
app.use(Validator.schemaValidation)

app.use(Validator.validateToken)
app.use(Validator.roleValidation)
app.use("/v1", routes)
app.use(ProxyMiddlewares.ProxyMiddleware)

app.use("*", ApiMiddlewares.middleware404)
app.use(ApiMiddlewares.exceptionHandler)

app.listen(port, async () => {
	// get redis client
	connectGlobalRedisClient()

	// migrations
	migrator()

	// generate schema file
	generateSchema()

	eventEmitter.emit("logging", `Auth ms is up and running on port: ${port}`)
})
