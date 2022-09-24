import {
	INodeProperties,
} from 'n8n-workflow';

export const messageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
			},
		},
		options: [
			{
				name: 'Find',
				value: 'find',
				description: 'Get a single message',
				action: 'Find a message',
			},
			{
				name: 'Where',
				value: 'where',
				description: 'Get all messages that match a criteria',
				action: 'Where a message',
			},
			{
				name: 'Download',
				value: 'download',
				description: 'Download a message attachment',
				action: 'Download a message',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send a message',
				action: 'Send a message',
			},
		],
		default: 'send',
	},
];

export const messageFields: INodeProperties[] = [
	// --------------------------------------------------------------------------
	// message:get -> operation:where
	// --------------------------------------------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'where',
				],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'where',
				],
				returnAll: [
					false,
				],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},

	// --------------------------------------------------------------------------
	// message:get -> operation:find
	// --------------------------------------------------------------------------
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'find', 'download',
				],
			},
		},
		default: '',
		description: 'Unique ID of the message',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'download',
				],
			},

		},
		placeholder: '',
		description: 'Name of the binary property which contains the data for the file to be created',
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'download',
				],
			},

		},
		placeholder: 'downloaded.pdf',
		description: '(Optional) File name to be outputed if setted',
	},

	// --------------------------------------------------------------------------
	// message:send -> operation:send
	// --------------------------------------------------------------------------
	{
		displayName: 'Method',
		name: 'method',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send',
				],
			},
		},
		options: [
			{
				name: 'Send Text',
				value: 'sendtext',
			},
			{
				name: 'Send Attachment By Url',
				value: 'sendurl',
			},
			{
				name: 'Send Attachment Binary',
				value: 'sendbinary',
			},
			{
				name: 'Send Attachment Base64',
				value: 'sendencoded',
			},
		],
		default: 'sendtext',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send',
				],
				method:[
					'sendtext', 'sendurl',
				],
			},
		},
		default: '',
		description: 'Text message',
	},
	{
		displayName: 'Chat ID',
		name: 'chatId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send',
				],
			},
		},
		default: '',
		description: 'Destination conversation, ChatId Group or any E164 Phone Number',
	},
	{
		displayName: 'Url',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send',
				],
				method: [
					'sendurl',
				],
			},
		},
		default: '',
		description: 'URL path to append attachment',
	},
	{
		displayName: 'File Name',
		name: 'filename',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send',
				],
				method: [
					'sendurl', 'sendbinary', 'sendencoded',
				],
			},
		},
		default: '',
		description: 'File name and extension, auto-generated',
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
					'message',
				],
				operation: [
					'send',
				],
			},
		},
	},
];
