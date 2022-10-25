import {
	INodeProperties,
} from 'n8n-workflow';

export const controlDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'control',
				],
			},
		},
		options: [
			{
				name: 'Get Picture',
				value: 'picture',
				description: 'Get a profile picture',
				action: 'Profile picture',
			},
			{
				name: 'Get Invite Link',
				value: 'invite',
				description: 'Get a group invite link',
				action: 'Invite link',
			},
		],
		default: 'picture',
	},
];

export const controlFields: INodeProperties[] = [
	{
		displayName: 'Chat ID',
		name: 'chatId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'control',
				],
				operation: [
					'picture','invite',
				],
			},
		},
		default: '',
		description: 'Destination conversation, ChatId Group or any E164 Phone Number',
	},
	{
		displayName: 'Picture ID',
		name: 'pictureId',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'control',
				],
				operation: [
					'picture',
				],
			},
		},
		default: '',
		description: 'Optional picture ID, used for know of updates cached',
	},
	{
		displayName: 'Download Binary',
		name: 'binary',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'control',
				],
				operation: [
					'picture',
				],
			},
		},
		default: false,
		description: 'Whether to return as binary format',
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
					'control',
				],
				operation: [
					'picture',
				],
				binary: [ true ],
			},
		},
		placeholder: '',
		description: 'Name of the binary property which contains the data for the file to be created',
	},
	{
		displayName: 'File Name',
		name: 'filename',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'control',
				],
				operation: [
					'picture',
				],
				binary: [ true ],
			},
		},
		default: '',
		description: 'File name and extension, auto-generated',
	},
];
