import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	NodeApiError,
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';

import { get } from 'lodash';

import type { Quepasa as QTypes } from './types';

// used from webhook authorization, avoid bots
import { Response } from 'express';

class RequestError extends Error {
	constructor(public options: OptionsWithUri, status: number, message: string) {
		super(message);
	}
}

export async function apiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: string, endpoint: QTypes.Endpoint = '', body: any = {}, qs: IDataObject = {}, uri?: string, headers: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	let baseUrl = this.getNodeParameter('baseUrl', 0, '') as string;
	let token = this.getNodeParameter('token', 0, '') as string;

	if (!baseUrl || !token) {
		const credentials = await this.getCredentials('quepasaTokenAuthApi') as QTypes.PathCredentials;
		baseUrl = baseUrl || credentials.baseUrl;
		token = token || credentials.accessToken;
	}

	const fullUri = baseUrl + `/v3/bot/${token}${endpoint}`;
	const options: OptionsWithUri = {
		headers: {
			Accept: 'application/json',
		},
		method,
		qs,
		uri: uri || fullUri,
	};

	if (endpoint === '/download') {
		options.encoding = null;
	} else {
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
		const responseData = await this.helpers.request!(options);
		if (endpoint === '/download') {
			return {
				data: responseData,
			};
		}

		if (responseData.success === false) {
			throw new NodeApiError(this.getNode(), responseData);
		}

		return responseData;
	} catch (error) {
		error = new RequestError(options, error.status, error.message);
		throw new NodeApiError(this.getNode(), error);
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
		uri: `${baseUrl}/v3/bot/${credentials.accessToken}`,
		json: true,
	};
	return options;
}

export function createWebHookFromTrigger(source: IHookFunctions): QTypes.Webhook {
	const reponse : QTypes.Webhook = {
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

		reponse.extra = data;
	}

	return reponse;
}
