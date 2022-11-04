import {
	IBinaryKeyData,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';

import {
	apiRequest,
} from '../GenericFunctions';

import type { Quepasa } from '../types';

export async function resourceMessage(this: IExecuteFunctions, operation: string, items: INodeExecutionData[], i: number): Promise<any> { // tslint:disable-line:no-any
	let responseData;
	if (operation === 'download') {
		const qs: IDataObject = {};
		const objectId = this.getNodeParameter('messageId', i) as string;
		qs.id = objectId;
		responseData = await apiRequest.call(this, 'GET', '/download', {}, qs);

		const itemsData: IBinaryKeyData = {};

		if (items[i].binary !== undefined) {
			// Create a shallow copy of the binary data so that the old
			// data references which do not get changed still stay behind
			// but the incoming data does not get changed.
			Object.assign(itemsData, items[i].binary);
		}

		const responseItem: INodeExecutionData = {
			json: items[i].json,
			binary: itemsData,
		};

		items[i] = responseItem;

		const fileName = this.getNodeParameter('fileName', i) as string;
		const binaryData = await this.helpers.prepareBinaryData(responseData.data, fileName || "unknownFileName");

		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
		items[i].binary![binaryPropertyName] = binaryData;
	}
	else if (operation === 'send'){
		const paramMethod =	this.getNodeParameter('method', i)		as string;
		const paramChatId =	this.getNodeParameter('chatId', i)		as string;
		const paramText = 	this.getNodeParameter('text', i, '')	as string;
		const paramTrackId = this.getNodeParameter('trackId', i, '') as string;

		const headers: IDataObject = {};
		if (paramTrackId && paramTrackId.trim().length > 0) {
			headers['X-QUEPASA-TRACKID'] = paramTrackId;
		}

		if (paramMethod === 'sendtext') {
			const body: Quepasa.SendRequest = {
				text: paramText,
				chatid: paramChatId,
			};
			responseData = await apiRequest.call(this, 'POST', '/sendtext', body, {}, undefined, headers);
		}
		else if (paramMethod === 'sendurl') {
			const paramUrl = this.getNodeParameter('url', i) as string;
			const paramFileName = this.getNodeParameter('filename', i, '') as string;
			const body: Quepasa.SendAttachmentUrlRequest = {
				chatid: paramChatId,
				url: paramUrl,
				text: paramText,
				filename: paramFileName,
			};
			responseData = await apiRequest.call(this, 'POST', '/sendurl', body, {}, undefined, headers);
		} else {
			throw new Error('Method not implemented.');
		}
	}
	else if (operation === 'where') {
		throw new Error('Method not implemented.');
	}
	else if (operation === 'find') {
		throw new Error('Method not implemented.');
	}

	return responseData;
}
