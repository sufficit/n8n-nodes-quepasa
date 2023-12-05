import {
	IBinaryKeyData,
	IDataObject,
	IExecuteFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
} from 'n8n-workflow';

import type { Readable } from 'stream';

import {
	apiRequest,
	getFileNameFromHeaderContent,
} from '../GenericFunctions';

import type { Quepasa as QTypes } from '../types';

export async function resourceMessage(this: IExecuteFunctions, operation: string, items: INodeExecutionData[], i: number): Promise<any> { // tslint:disable-line:no-any

	let fullResponse: IN8nHttpFullResponse;
	if (operation === 'download') {
		const qs: IDataObject = {};
		const messageid = this.getNodeParameter('messageId', i) as string;
		qs.messageid = messageid;
		fullResponse = await apiRequest.call(this, 'GET', '/download', {}, qs);

		const itemsData: IBinaryKeyData = {};

		if (items[i].binary !== undefined) {
			// Create a shallow copy of the binary data so that the old
			// data references which do not get changed still stay behind
			// but the incoming data does not get changed.
			Object.assign(itemsData, items[i].binary);
		}

		let fileName: string | undefined = this.getNodeParameter('fileName', i) as string;
		if (!fileName) {
			fileName = getFileNameFromHeaderContent(fullResponse.headers);
		}

		const buffer = fullResponse.body as Buffer | Readable;
		const binaryData = await this.helpers.prepareBinaryData(buffer, fileName || "unknownFileName");
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

		const responseItem: INodeExecutionData = {
			json: items[i].json,
			binary: itemsData,
		};
		responseItem.binary![binaryPropertyName] = binaryData;
		items[i] = responseItem;
		return;
	}
	else if (operation === 'send'){
		const paramMethod =	this.getNodeParameter('method', i)		as string;
		const paramChatId =	this.getNodeParameter('chatId', i)		as string;
		const paramText = 	this.getNodeParameter('text', i, '')	as string;
		const paramTrackId = this.getNodeParameter('trackId', i, '') as string;
		const paramInReply = this.getNodeParameter('inReply', i, '') as string;
		const messageid = this.getNodeParameter('messageId', i, '') as string;

		const headers: IDataObject = {};
		if (paramTrackId && paramTrackId.trim().length > 0) {
			headers['X-QUEPASA-TRACKID'] = paramTrackId;
		}

		if (paramMethod === 'sendtext') {
			const body: QTypes.SendRequest = {
				id: messageid,
				text: paramText,
				chatid: paramChatId,
			};

			fullResponse = await apiRequest.call(this, 'POST', '/sendtext', body, {}, undefined, headers);
		}
		else if (paramMethod === 'sendurl') {
			const paramUrl = this.getNodeParameter('url', i) as string;
			const paramFileName = this.getNodeParameter('filename', i, '') as string;
			const body: QTypes.SendAttachmentUrlRequest = {
				id: messageid,
				chatid: paramChatId,
				inreply: paramInReply,
				url: paramUrl,
				text: paramText,
				filename: paramFileName,
			};

			fullResponse = await apiRequest.call(this, 'POST', '/sendurl', body, {}, undefined, headers);
		} else {
			throw new Error('Method not implemented: ' + paramMethod);
		}
	}
	else if (operation === 'revoke') {
		const qs: IDataObject = {};
		const messageid = this.getNodeParameter('messageId', i) as string;
		qs.messageid = messageid;

		fullResponse = await apiRequest.call(this, 'DELETE', '/message', {}, qs)
		.then((response) => {
			return response;
		}).catch((error) => {
			return error.response ?? error;
		});
	}
	else if (operation === 'where') {
		throw new Error('Operation not implemented: ' + operation);
	}
	else if (operation === 'find') {
		throw new Error('Operation not implemented: ' + operation);
	}
	else {
		throw new Error('Operation not implemented: ' + operation);
	}

	return fullResponse?.body;
}
