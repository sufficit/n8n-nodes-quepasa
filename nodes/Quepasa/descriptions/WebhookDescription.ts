import {
	INodeProperties,
} from 'n8n-workflow';

export const webhookDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'webhook',
				],
			},
		},
		options: [
			{
				name: 'Find',
				value: 'find',
				description: 'Get a single webhook',
				action: 'Find a webhook',
			},
			{
				name: 'Setup',
				value: 'setup',
				description: 'Setup a new webhook',
				action: 'Setup a webhook',
			},
			{
				name: 'Remove',
				value: 'remove',
				description: 'Remove a URL from the list',
				action: 'Remove a webhook',
			},
			{
				name: 'Clear',
				value: 'clear',
				description: 'Remove all webhooks from the list',
				action: 'Clear a webhook',
			},
		],
		default: 'find',
	},
];

export const webhookFields: INodeProperties[] = [
	{
		displayName: 'Url',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'webhook',
				],
				operation: [
					'setup', 'remove',
				],
			},
		},
		default: '',
		description: 'URL to trigger events',
	},
	{
		displayName: 'Forward Internal',
		name: 'forwardInternal',
		type: 'boolean',
		default: true,
		description: 'Whether forward internal (Optional)',
		displayOptions: {
			show: {
				resource: [
					'webhook',
				],
				operation: [
					'setup',
				],
			},
		},
	},
	{
		displayName: 'Track ID',
		name: 'trackId',
		type: 'string',
		default: '',
		description: '(Optional) System identifier, avoid duplicated messages',
		displayOptions: {
			show: {
				resource: [
					'webhook',
				],
				operation: [
					'setup',
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
		displayOptions: {
			show: {
				resource: [
					'webhook',
				],
				operation: [
					'setup',
				],
			},
		},
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
];
