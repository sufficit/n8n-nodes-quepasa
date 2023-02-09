import {
	IDataObject,
	IExecuteFunctions,
} from 'n8n-workflow';

import {
	apiRequest,
} from '../GenericFunctions';

import type { Quepasa as QTypes } from '../types';

export async function resourceWebhook(this: IExecuteFunctions, operation: string, items: any, i: number): Promise<any> { // tslint:disable-line:no-any
	let fullResponse;
	if (operation === 'find') {
		fullResponse = await apiRequest.call(this, 'GET', '/webhook');
	}
	else if (operation === 'setup'){
		const reqBody: QTypes.Webhook = {
			url: this.getNodeParameter('url', i) as string,
			forwardinternal: this.getNodeParameter('forwardInternal', i) as boolean,
			trackid: this.getNodeParameter('trackId', i) as string,
		};

		const parExtraAttributes = this.getNodeParameter('extraAttributes',i , {}) as IDataObject;
		if (parExtraAttributes && parExtraAttributes.attribute) {
			const data: IDataObject = {}; // tslint:disable-line:no-any

			const atts = parExtraAttributes.attribute as IDataObject[];
			atts.map(property => {
				data[property.key as string] = property.value;
			});

			reqBody.extra = data;
		}
		fullResponse = await apiRequest.call(this, 'POST', '/webhook', reqBody);
	}
	else if (operation === 'remove') {
		const body: QTypes.Webhook = {
			url: this.getNodeParameter('url', i) as string,
		};
		fullResponse = await apiRequest.call(this, 'DELETE', '/webhook', body);
	}
	else if (operation === 'clear') {
		fullResponse = await apiRequest.call(this, 'DELETE', '/webhook');
	}

	return fullResponse?.body;
}
