export declare namespace Quepasa {

	export type Resource = 'information' | 'message' | 'webhook' | 'control';
	export type Endpoint = '' | '/info' | '/webhook' | '/download' | '/sendtext' | '/sendurl' | '/picinfo' | '/picdata' | '/invite';

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

	export type GetWebhookResponse = Response & {
		webhooks?: Webhook[];
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
		chatid: string;
		text?: string;
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
