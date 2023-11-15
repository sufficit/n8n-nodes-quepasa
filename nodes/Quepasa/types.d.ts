import { IDataObject } from "n8n-workflow";

export declare namespace Quepasa {

	export type Resource = 'information' | 'message' | 'webhook' | 'control';
	export type Endpoint = '' | '/info' | '/webhook' | '/download' | '/sendtext' | '/sendurl' | '/picinfo' | '/picdata' | '/invite' | '/message';

	export type PathCredentials = {
		baseUrl: string;
		accessToken: string;
	}

	export type Organization = {
		active: boolean;
		id: number;
		name: string;
	};

	export type Response = {
		success: boolean;
		status: string;
	}

	export type ResponseWithHeaders = Response & {
		headers?: IDataObject[];
	}

	export type ResponseGeneric = ResponseWithHeaders & {
		body: any;
	}

	export type WebhookGetResponse = ResponseWithHeaders & {
		webhooks?: Webhook[];
	}

	// POST | DELETE
	export type WebhookUpdateResponse = ResponseWithHeaders & {
		affected?: number;
	}

	export type Webhook = {
		url: string;
		forwardinternal?: boolean;
		trackid?: string;
		success?: Date;
		extra?: any;
	}

	// --------------------------------------------------------------------------
	// message:send -> operation:send methods
	//

	export type SendRequest = {
		id?: string;
		chatid: string;
		text?: string;
		inreply?: string;
	};

	export type SendAttachmentUrlRequest = SendRequest & {
		url: string;
		filename?: string;
	};

	//
	// --------------------------------------------------------------------------

	export type RequestError = Error & Response & {
		config: any;
	};
}
