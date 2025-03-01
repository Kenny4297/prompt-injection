import {
	DEFENCE_ID,
	DefenceConfigItem,
	Defence,
	DefenceResetResponse,
} from '@src/models/defence';

import { sendRequest } from './backendService';

const PATH = 'defence/';

async function getDefences(level: number) {
	const response = await sendRequest(`${PATH}status?level=${level}`, {
		method: 'GET',
	});
	return (await response.json()) as Defence[];
}

async function toggleDefence(
	defenceId: DEFENCE_ID,
	isActive: boolean,
	level: number
): Promise<boolean> {
	const requestPath = isActive ? 'deactivate' : 'activate';
	const response = await sendRequest(`${PATH}${requestPath}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ defenceId, level }),
	});
	return response.status === 200;
}

async function configureDefence(
	defenceId: string,
	config: DefenceConfigItem[],
	level: number
): Promise<boolean> {
	const response = await sendRequest(`${PATH}configure`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ defenceId, config, level }),
	});
	return response.status === 200;
}

async function resetDefenceConfig(
	defenceId: string,
	configId: string
): Promise<DefenceResetResponse> {
	const response = await sendRequest(`${PATH}resetConfig`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ defenceId, configId }),
	});
	return (await response.json()) as DefenceResetResponse;
}

function validatePositiveNumberConfig(config: string) {
	// config is a number greater than zero
	return !isNaN(Number(config)) && Number(config) > 0;
}

function validateNonEmptyStringConfig(config: string) {
	// config is non empty string and is not a number
	return config !== '' && !Number(config);
}

function validateFilterConfig(config: string) {
	// config is not a list of empty commas
	const commaPattern = /^,*,*$/;
	return config === '' || !commaPattern.test(config);
}

function validateDefence(id: string, config: string) {
	switch (id) {
		case DEFENCE_ID.CHARACTER_LIMIT:
			return validatePositiveNumberConfig(config);
		case DEFENCE_ID.FILTER_USER_INPUT:
		case DEFENCE_ID.FILTER_BOT_OUTPUT:
			return validateFilterConfig(config);
		default:
			return validateNonEmptyStringConfig(config);
	}
}

async function resetActiveDefences(level: number) {
	const response = await sendRequest(`${PATH}reset`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ level }),
	});
	return response.status === 200;
}

export {
	getDefences,
	toggleDefence,
	configureDefence,
	resetDefenceConfig,
	resetActiveDefences,
	validateDefence,
};
