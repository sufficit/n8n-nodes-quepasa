import {
	IDataObject,
	IHookFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeApiError,
} from 'n8n-workflow';

import {
	apiRequest,
	authorizationError,
	createWebHookFromTrigger,
} from './GenericFunctions';

import isbot from 'isbot';

import type { Quepasa as QTypes } from './types';

export class QuepasaTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Quepasa Trigger',
		name: 'quepasaTrigger',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:favicon.png',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when Quepasa events occur',
		defaults: {
			name: 'Quepasa Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'quepasaTokenAuthApi',
				testedBy: 'quepasaTokenAuthApiTest',
				required: true,
				displayOptions: {
					show: {
						authentication: [
							'predefinedCredentialType',
						],
					},
				},
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'default',
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				noDataExpression: true,
				type: 'options',
				required: true,
				options: [
					{
						name: 'Parameters',
						value: 'parametersCredentialType',
					},
					{
						name: 'Predefined Quepasa Credentials',
						value: 'predefinedCredentialType',
						description: 'BaseUrl + Token',
					},
				],
				default: 'parametersCredentialType',
			},
			{
				displayName: 'BaseUrl',
				name: 'baseUrl',
				type: 'string',
				default: '',
				required: true,
				description: 'Base URL',
				placeholder: 'https://api.quepasa.org:31000',
				displayOptions: {
					show: {
						authentication: [
							'parametersCredentialType',
						],
					},
				},
			},
			{
				displayName: 'Token',
				name: 'token',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				description: 'Token of Whatsapp bot, override credentials',
				placeholder: '00000000-0000-0000-0000-000000000000',
				displayOptions: {
					show: {
						authentication: [
							'parametersCredentialType',
						],
					},
				},
			},
			{
				displayName: 'Forward Internal',
				name: 'forwardInternal',
				type: 'boolean',
				default: false,
				description: 'Whether should forward internal messages sent by api',
			},
			{
				displayName: 'Track ID',
				name: 'trackId',
				type: 'string',
				default: '',
				description: '(Optional) System identifier, avoid duplicated messages',
				displayOptions: {
					show: {
						forwardInternal: [
							true,
						],
					},
				},
			},
			{
				displayName: 'Extra Attributes',
				name: 'extraAttributes',
				placeholder: 'Add Attributes',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'attribute',
						displayName: 'Attributes',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Key of the attribute',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to set for the attribute',
							},
						],
					},
				],
			},
		],
	};

	// @ts-ignore (because of request)
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookUrl === undefined) {
					// No webhook id is set so no webhook can exist
					return false;
				}

				try {
					const webhook : QTypes.Webhook = createWebHookFromTrigger(this);
					const headers: IDataObject = {
						'X-QUEPASA-WHURL': webhook.url,
					};

					// Check all the webhooks which exist already if it is identical to the
					// one that is supposed to get created.
					const fullResponse = await apiRequest.call(this, 'GET', '/webhook', {}, {}, undefined, headers);
					if (fullResponse.statusCode !== 200){
						throw new NodeApiError(this.getNode(), { httpCode: fullResponse.statusCode , message: fullResponse.statusMessage ?? "invalid request" });
					}

					const response = fullResponse.body as QTypes.WebhookGetResponse;
					if (!response.success) {
						throw new NodeApiError(this.getNode(), response as QTypes.Response);
					}

					response.webhooks?.forEach((item) => { if(item === webhook) return true; });
					return false;
				} catch {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhook : QTypes.Webhook = createWebHookFromTrigger(this);
				try {
					const fullResponse = await apiRequest.call(this, 'POST', '/webhook', webhook);
					if (fullResponse.statusCode !== 200){
						throw new NodeApiError(this.getNode(), { httpCode: fullResponse.statusCode , message: fullResponse.statusMessage ?? "invalid request" });
					}

					const response = fullResponse.body as QTypes.WebhookUpdateResponse;
					if (response.affected === undefined || response.affected === 0) {
						// Required data is missing so was not successful
						return false;
					}

					webhookData.webhookUrl = webhook.url;
					return true;
				} catch {
					return false;
				}
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookUrl !== undefined) {
					const body = { url: webhookData.webhookUrl, };
					try {
						const fullResponse = await apiRequest.call(this, 'DELETE', '/webhook', body);
						if (fullResponse.statusCode !== 200){
							throw new NodeApiError(this.getNode(), { httpCode: fullResponse.statusCode , message: fullResponse.statusMessage ?? "invalid request" });
						}

						const response = fullResponse.body as QTypes.WebhookUpdateResponse;
						if (response.affected === undefined || response.affected === 0) {
							// Required data is missing so was not successful
							return false;
						}

						// Remove from the static workflow data so that it is clear
						// that no webhooks are registred anymore
						delete webhookData.webhookUrl;

						return true;
					} catch {
						return false;
					}
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData>
	{
		// checking for malicious bots
		const realm = 'Webhook';
		const resp = this.getResponseObject();
		const headers = this.getHeaderData();
		const userAgent = (headers as IDataObject)['user-agent'] as string;

		if (!userAgent.startsWith("Quepasa") && isbot(userAgent)) {
			return authorizationError(resp, realm, 403);
		}

		const req = this.getRequestObject();

		return {
			workflowData: [this.helpers.returnJsonArray(req.body)],
		};
	}
}
