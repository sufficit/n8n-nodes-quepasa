import {
	IExecuteFunctions,
} from 'n8n-workflow';

import {
	apiRequest,
} from '../GenericFunctions';

import type { Quepasa as QTypes } from '../types';

export async function resourceWebhook(this: IExecuteFunctions, operation: string, items: any, i: number): Promise<any> { // tslint:disable-line:no-any
	let responseData;
	if (operation === 'find') {
		responseData = await apiRequest.call(this, 'GET', '/webhook');
	}
	else if (operation === 'setup'){
		const body: QTypes.Webhook = {
			url: this.getNodeParameter('url', i) as string,
			forwardinternal: this.getNodeParameter('forwardInternal', i) as boolean,
			trackid: this.getNodeParameter('trackId', i) as string,
		};
		responseData = await apiRequest.call(this, 'POST', '/webhook', body);
	}
	else if (operation === 'remove') {
		const body: QTypes.Webhook = {
			url: this.getNodeParameter('url', i) as string,
		};
		responseData = await apiRequest.call(this, 'DELETE', '/webhook', body);
	}
	else if (operation === 'clear') {
		responseData = await apiRequest.call(this, 'DELETE', '/webhook');
	}

	return responseData;
}
