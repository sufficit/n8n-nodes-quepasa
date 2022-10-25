import {
	IBinaryKeyData,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';

import {
	apiRequest,
} from '../GenericFunctions';

export async function resourceControl(this: IExecuteFunctions, operation: string, items: any, i: number): Promise<any> { // tslint:disable-line:no-any
	const paramChatId = this.getNodeParameter('chatId', i) as string;

	let responseData;
	if (operation === 'picture') {
		const paramBinary = this.getNodeParameter('binary', i, false) as boolean;
		const paramPictureId = this.getNodeParameter('pictureId', i, '') as string;
		const endpoint = paramBinary ? '/picdata' : '/picinfo';

		const reqQuery: IDataObject = {}; // tslint:disable-line:no-any
		reqQuery['chatid'] = paramChatId;
		if (paramPictureId) {
			reqQuery['pictureid'] = paramPictureId;
		}

		responseData = await apiRequest.call(this, 'GET', endpoint, {}, reqQuery);
		if (paramBinary) {
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
	}
	else if (operation === 'invite'){
		const reqQuery: IDataObject = {}; // tslint:disable-line:no-any
		reqQuery['chatid'] = paramChatId;
		responseData = await apiRequest.call(this, 'GET', '/invite', {}, reqQuery);
	}

	return responseData;
}
