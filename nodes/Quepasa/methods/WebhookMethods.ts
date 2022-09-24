import {
	IExecuteFunctions,
} from 'n8n-workflow';

import {
	apiRequest,
} from '../GenericFunctions';

import type { Quepasa } from '../types';

export async function resourceWebhook(this: IExecuteFunctions, operation: string, items: any, i: number): Promise<any> { // tslint:disable-line:no-any
	let responseData;
	if (operation === 'find') {
		responseData = await apiRequest.call(this, 'GET', '/webhook');
	}
	else if (operation === 'setup'){
		const paramWebhookUrl = this.getNodeParameter('url', i) as string;
		const paramForwardInternal = this.getNodeParameter('forwardInternal', i) as boolean;
		const paramTrackId = this.getNodeParameter('trackId', i) as string;
		const body: Quepasa.Webhook = {
			url: paramWebhookUrl,
			forwardinternal: paramForwardInternal,
			trackid: paramTrackId,
		};
		responseData = await apiRequest.call(this, 'POST', '/webhook', body);
	}
	else if (operation === 'remove') {
		const paramWebhookUrl = this.getNodeParameter('url', i) as string;
		const body: Quepasa.Webhook = {
			url: paramWebhookUrl,
		};
		responseData = await apiRequest.call(this, 'DELETE', '/webhook', body);
	}
	else if (operation === 'clear') {
		responseData = await apiRequest.call(this, 'DELETE', '/webhook');
	}

	return responseData;
}
