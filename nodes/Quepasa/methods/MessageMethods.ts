import {
	IBinaryKeyData,
	IDataObject,
	IExecuteFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	NodeOperationError,
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
		const messageid = this.getNodeParameter('messageid', i) as string;
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

		const headers: IDataObject = {};

		const chatid = this.getNodeParameter('chatid', i)		as string;
		if (!chatid || chatid.trim().length === 0 || chatid.trim() === 'null' || chatid.trim() === 'undefined')
			throw new Error('missing chat id');

		headers['X-QUEPASA-CHATID'] = chatid.trim();

		const trackid = this.getNodeParameter('trackid', i, '') as string;
		if (trackid && trackid.trim().length > 0) {
			headers['X-QUEPASA-TRACKID'] = trackid;
		}

		const body: QTypes.SendRequestJsonBody = {
			id: this.getNodeParameter('messageid', i, '') as string,
			text: this.getNodeParameter('text', i, '')	as string,
			inreply: this.getNodeParameter('inreply', i, '')	as string,
			filename: this.getNodeParameter('filename', i, '') as string,
			filelength: this.getNodeParameter('filelength', i, 0) as number,
			mime: this.getNodeParameter('mime', i, '') as string,
			url: this.getNodeParameter('url', i, '')	as string,
			content: this.getNodeParameter('content', i, '')	as string,
		};

		if (body.id?.trim().length === 0)	delete body.id;
		if (body.text?.trim().length === 0)	delete body.text;
		if (body.inreply?.trim().length === 0)	delete body.inreply;
		if (body.filename?.trim().length === 0)	delete body.filename;
		if ((body.filelength ?? 0) <= 0) delete body.filelength;
		if (body.mime?.trim().length === 0)	delete body.mime;
		if (body.url?.trim().length === 0)	delete body.url;
		if (body.content?.trim().length === 0)	delete body.content;

		const method =this.getNodeParameter('method', i) as QTypes.SendMethod;
		if (method === 'sendany' || method === 'sendtext' || method === 'sendurl' || method === 'sendencoded') {
			fullResponse = await apiRequest.call(this, 'POST', '/send', body, {}, undefined, headers);
		}
		else if (method === 'sendbinary')
		{
			if (items[i].binary === undefined)
				throw new NodeOperationError(this.getNode(), 'missing binary data');

			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i, 'data') as string;
			const binary = items[i].binary![binaryPropertyName];

			if (!body.mime && binary.mimeType)
				body.mime = binary.mimeType;

			if (!body.filename && binary.fileName) {
				body.filename = binary.fileName;

				{ // extension
					let fileExtension = binary.fileExtension;

					if (!fileExtension && body.mime) {
						const mime = require('mime-types');
						fileExtension = mime.extension(body.mime);
					}

					if (fileExtension)
						body.filename += `.${fileExtension}`;
				}
			}

			if (body.filename) {
				headers['Content-Disposition'] = `attachment;filename=${body.filename}`;
				delete body.filename;
			}

			if (body.mime) {
				headers['Content-Type'] = body.mime;
				delete body.mime;
			}

			const buffer = Buffer.from(binary.data, 'base64');
			fullResponse = await apiRequest.call(this, 'POST', '/sendbinary', buffer, body, undefined, headers);
		}
		else
		{
			throw new NodeOperationError(this.getNode(), 'Send Method not implemented: ' + method);
			// fullResponse = await apiRequest.call(this, 'POST', '/sendbinary', body, {}, undefined, headers);
		}
	}
	else if (operation === 'revoke') {
		const qs: IDataObject = {};
		const messageid = this.getNodeParameter('messageid', i) as string;
		qs.messageid = messageid;

		fullResponse = await apiRequest.call(this, 'DELETE', '/message', {}, qs)
		.then((response) => {
			return response;
		}).catch((error) => {
			return error.response ?? error;
		});
	}
	else if (operation === 'where') {
		throw new NodeOperationError(this.getNode(), 'Operation not implemented: ' + operation);
	}
	else if (operation === 'find') {
		throw new NodeOperationError(this.getNode(), 'Operation not implemented: ' + operation);
	}
	else {
		throw new NodeOperationError(this.getNode(), 'Operation not implemented: ' + operation);
	}

	return fullResponse?.body;
}
