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

export async function resourceControl(this: IExecuteFunctions, operation: string, items: any, i: number): Promise<any> { // tslint:disable-line:no-any
	const paramChatId = this.getNodeParameter('chatId', i) as string;

	let fullResponse: IN8nHttpFullResponse;
	if (operation === 'picture') {
		const paramBinary = this.getNodeParameter('binary', i, false) as boolean;
		const paramPictureId = this.getNodeParameter('pictureId', i, '') as string;
		const endpoint = paramBinary ? '/picdata' : '/picinfo';

		const reqQuery: IDataObject = {}; // tslint:disable-line:no-any
		reqQuery['chatid'] = paramChatId;
		if (paramPictureId) {
			reqQuery['pictureid'] = paramPictureId;
		}

		if (paramBinary) {
			const itemsData: IBinaryKeyData = {};

			if (items[i].binary !== undefined) {
				// Create a shallow copy of the binary data so that the old
				// data references which do not get changed still stay behind
				// but the incoming data does not get changed.
				Object.assign(itemsData, items[i].binary);
			}

			fullResponse = await apiRequest.call(this, 'GET', endpoint, {}, reqQuery);
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
	}
	else if (operation === 'invite'){
		const reqQuery: IDataObject = {}; // tslint:disable-line:no-any
		reqQuery['chatid'] = paramChatId;
		fullResponse = await apiRequest.call(this, 'GET', '/invite', {}, reqQuery) as IN8nHttpFullResponse;
		return fullResponse.body;
	}
	else {
		throw new Error('Operation not implemented: ' + operation);
	}
}
