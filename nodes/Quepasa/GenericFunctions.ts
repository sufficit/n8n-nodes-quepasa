import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IN8nHttpFullResponse,
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';

import { get } from 'lodash';

import type { Quepasa as QTypes } from './types';

// used from webhook authorization, avoid bots
import { Response } from 'express';

export async function apiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: IHttpRequestMethods, endpoint: QTypes.Endpoint = '', body: any = {}, qs: IDataObject = {}, uri?: string, headers: IDataObject = {}): Promise<IN8nHttpFullResponse> { // tslint:disable-line:no-any
	let baseUrl = this.getNodeParameter('baseUrl', 0, '') as string;
	let token = this.getNodeParameter('token', 0, '') as string;

	if (!baseUrl || !token) {
		const credentials = await this.getCredentials('quepasaTokenAuthApi') as QTypes.PathCredentials;
		baseUrl = baseUrl || credentials.baseUrl;
		token = token || credentials.accessToken;
	}

	const fullUri = baseUrl + `${endpoint}`;
	const options: IHttpRequestOptions = {
		headers: {
			Accept: 'application/json',
			'X-QUEPASA-TOKEN': token,
		},
		method,
		qs,
		url: uri || fullUri,
		timeout: 15000, // changing default timeout to 15 seconds. avoid thread lock
		returnFullResponse: true, // return IN8nHttpFullResponse
	};

	if (endpoint === '/download' || endpoint === '/picdata') {
		options.encoding = 'arraybuffer';
		options.json = false;
	} else {
		options.encoding = 'json';
		options.json = true;
	}

	if (Object.keys(headers).length !== 0) {
		options.headers = Object.assign({}, options.headers, headers);
	}

	if (Object.keys(body).length !== 0) {
		options.body = body;
	}

	qs = qs || {};
	if (options.qs && Object.keys(options.qs).length === 0) {
		delete options.qs;
	}

	try {
		return await this.helpers.httpRequest(options) as IN8nHttpFullResponse;
	}
	catch (innerException)
	{
		const status = innerException.response?.data?.string as string || undefined;
		const exception: QTypes.RequestError = {
			success: false,
			status: status ?? "unknown error",
			name: innerException.name,
			message: innerException.message,
			config: innerException.config,
		};
		throw exception;
	}
}

export function eventExists(currentEvents: string[], webhookEvents: IDataObject) {
	for (const currentEvent of currentEvents) {
		if (get(webhookEvents, `${currentEvent.split('.')[0]}.${currentEvent.split('.')[1]}`) !== true) {
			return false;
		}
	}
	return true;
}

export function authorizationError(resp: Response, realm: string, responseCode: number, message?: string) {
	if (message === undefined) {
		message = 'Authorization problem!';
		if (responseCode === 401) {
			message = 'Authorization is required!';
		} else if (responseCode === 403) {
			message = 'Authorization data is wrong!';
		}
	}

	resp.writeHead(responseCode, { 'WWW-Authenticate': `Basic realm="${realm}"` });
	resp.end(message);
	return {
		noWebhookResponse: true,
	};
}

export function requestBotInfo(credentials: QTypes.PathCredentials){
	let baseUrl = credentials.baseUrl;
	if (baseUrl.endsWith("/")){
		baseUrl = baseUrl.slice(0, -1);
	}

	const options: OptionsWithUri = {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'X-QUEPASA-TOKEN': credentials.accessToken,
		},
		uri: baseUrl,
		json: true,
	};
	return options;
}

export function createWebHookFromTrigger(source: IHookFunctions): QTypes.Webhook {
	const reqBody : QTypes.Webhook = {
		url: source.getNodeWebhookUrl('default')!,
		forwardinternal: source.getNodeParameter('forwardInternal', false) as boolean,
		trackid: source.getNodeParameter('trackId', '') as string ?? undefined,
	};

	const parExtraAttributes = source.getNodeParameter('extraAttributes', {}) as IDataObject;
	if (parExtraAttributes && parExtraAttributes.attribute) {
		const data: IDataObject = {}; // tslint:disable-line:no-any

		const atts = parExtraAttributes.attribute as IDataObject[];
		atts.map(property => {
			data[property.key as string] = property.value;
		});

		reqBody.extra = data;
	}

	return reqBody;
}

export function getFileNameFromHeaderContent(source: IDataObject): string | undefined {
	if(source) {
		const disposition = source['content-disposition'] as string;
		if (disposition && disposition.indexOf('attachment') !== -1) {
			const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
			const matches = filenameRegex.exec(disposition);
				if (matches != null && matches[1]) {
					return matches[1].replace(/['"]/g, '');
				}
		}
	}
}
