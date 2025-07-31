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
				name: 'Download',
				value: 'download',
				description: 'Download a message attachment',
				action: 'Download a message',
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Get a single message',
				action: 'Find a message',
			},
			{
				name: 'Revoke',
				value: 'revoke',
				description: 'Revoke|Cancel|Delete message',
				action: 'Revoke message',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send a message',
				action: 'Send a message',
			},
			{
				name: 'Where',
				value: 'where',
				description: 'Get all messages that match a criteria',
				action: 'Where a message',
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
	// message:get -> operation:find,download
	// --------------------------------------------------------------------------
	{
		displayName: 'Message ID',
		name: 'messageid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'find', 'download', 'revoke',
				],
			},
		},
		default: '',
		description: 'Unique ID of the message',
	},
	// --------------------------------------------------------------------------
	// message:post -> operation:send
	// --------------------------------------------------------------------------
	{
		displayName: 'Message ID',
		name: 'messageid',
		type: 'string',
		default: '',
		description: '(Optional) Message identifier, used for check status, revoke or edit messages after sent',
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
		description: '(Optional) File name to output if set',
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
				name: 'Send Any',
				value: 'sendany',
			},
			{
				name: 'Send Attachment Base64',
				value: 'sendencoded',
			},
			{
				name: 'Send Attachment Binary',
				value: 'sendbinary',
			},
			{
				name: 'Send Attachment By Url',
				value: 'sendurl',
			},
			{
				name: 'Send Text',
				value: 'sendtext',
			},
		],
		default: 'sendany',
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
					'send',
				],
				method:[
					'sendbinary'
				],
			},
		},
		placeholder: '',
		description: 'Name of the binary property which contains the data for the file to be created',
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
					'sendany', 'sendtext', 'sendurl', 'sendencoded',
				],
			},
		},
		default: '',
		description: 'Text message',
	},
	{
		displayName: 'Chat ID',
		name: 'chatid',
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
		displayName: 'BASE64 Content',
		name: 'content',
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
					'sendany',
				],
			},
		},
		default: '',
		description: '(Optional) BASE64 content to append attachment',
	},
	{
		displayName: 'BASE64 Content',
		name: 'content',
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
					'sendencoded',
				],
			},
		},
		default: '',
		description: 'BASE64 content to append attachment',
	},
	{
		displayName: 'Url',
		name: 'url',
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
					'sendany'
				],
			},
		},
		default: '',
		description: '(Optional) URL path to append attachment',
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
					'sendany', 'sendurl', 'sendbinary', 'sendencoded',
				],
			},
		},
		default: '',
		description: '(Optional) File name and extension, auto-generated',
	},
	{
		displayName: 'MIME',
		name: 'mime',
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
					'sendany', 'sendurl', 'sendbinary', 'sendencoded',
				],
			},
		},
		placeholder: 'application/pdf',
		default: '',
		description: '(Optional) MIME',
	},
	{
		displayName: 'File Length',
		name: 'filelength',
		type: 'number',
		displayOptions: {
			show: {
				resource: [
					'message',
				],
				operation: [
					'send',
				],
				method: [
					'sendany', 'sendurl', 'sendbinary', 'sendencoded',
				],
			},
		},
		placeholder: '00000000',
		default: '',
		description: '(Optional) Content Bytes',
	},
	{
		displayName: 'Track ID',
		name: 'trackid',
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
	{
		displayName: 'In Reply To',
		name: 'inreply',
		type: 'string',
		default: '',
		description: '(Optional) Message ID for reply to',
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
