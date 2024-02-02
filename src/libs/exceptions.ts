import Ajv from "ajv"
export class ServerError extends Error {
	constructor(
		public statusCode: number,
		public message: string,
		public errorCode?: string,
		public data?: any
	) {
		super(message)
	}
}

export class BadRequestException extends ServerError {
	constructor(
		message: string = "Bad Request",
		errorCode: string = "bad_request"
	) {
		super(400, message, errorCode)
	}
}

export class PayloadValidationException extends ServerError {
	// @ts-ignore
	constructor(errors: Ajv["errors"] = []) {
		super(400, "Bad Request", "body_validation_exception", errors)
	}
}

export class UnauthorizedException extends ServerError {
	constructor(description?: string) {
		super(
			401,
			description ? `Unauthorized: ${description}` : "Unauthorized",
			"unauthorized"
		)
	}
}
export class ForbiddenException extends ServerError {
	constructor(description?: string) {
		super(
			403,
			description ? `Forbidden: ${description}` : "Forbidden",
			"forbidden"
		)
	}
}

export class EntityNotFoundException extends ServerError {
	constructor(
		message: string = "Entity Not Found",
		errorCode: string = "not_found"
	) {
		super(404, message, errorCode)
	}
}

export class InternalServerException extends ServerError {
	constructor(message: string = "Internal Server Error") {
		super(500, message, "unexpected_error")
	}
}
