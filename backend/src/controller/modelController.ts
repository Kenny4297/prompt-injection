import { Request, Response } from 'express';

import { OpenAIGetModelRequest } from '@src/models/api/OpenAIGetModelRequest';
import { OpenAiConfigureModelRequest } from '@src/models/api/OpenAiConfigureModelRequest';
import { OpenAiSetModelRequest } from '@src/models/api/OpenAiSetModelRequest';
import { ChatModelConfiguration, MODEL_CONFIG } from '@src/models/chat';
import { getValidOpenAIModelsList } from '@src/openai';

function updateConfigProperty(
	config: ChatModelConfiguration,
	configId: MODEL_CONFIG,
	value: number,
	max: number
): ChatModelConfiguration | null {
	if (value >= 0 && value <= max) {
		config[configId] = value;
		return config;
	}
	return null;
}

function handleSetModel(req: OpenAiSetModelRequest, res: Response) {
	const { model } = req.body;

	if (model === undefined) {
		res.status(400).send();
	} else {
		const configuration =
			req.body.configuration ?? req.session.chatModel.configuration;
		req.session.chatModel = { id: model, configuration };
		console.debug('GPT model set:', JSON.stringify(req.session.chatModel));
		res.status(200).send();
	}
}

function handleConfigureModel(req: OpenAiConfigureModelRequest, res: Response) {
	const configId = req.body.configId as MODEL_CONFIG | undefined;
	const value = req.body.value;

	let updated = null;

	if (configId && value && value >= 0) {
		const lastConfig = req.session.chatModel.configuration;
		switch (configId) {
			case MODEL_CONFIG.TEMPERATURE:
				updated = updateConfigProperty(lastConfig, configId, value, 2);
				break;
			case MODEL_CONFIG.TOP_P:
				updated = updateConfigProperty(lastConfig, configId, value, 1);
				break;
			case MODEL_CONFIG.FREQUENCY_PENALTY:
				updated = updateConfigProperty(lastConfig, configId, value, 2);
				break;
			case MODEL_CONFIG.PRESENCE_PENALTY:
				updated = updateConfigProperty(lastConfig, configId, value, 2);
				break;
			default:
				res.status(400).send();
		}
		if (updated) {
			req.session.chatModel.configuration = updated;
			res.status(200).send();
		} else {
			res.status(400).send();
		}
	}
}

function handleGetModel(req: OpenAIGetModelRequest, res: Response) {
	res.send(req.session.chatModel);
}

function handleGetValidModels(_: Request, res: Response) {
	const models = getValidOpenAIModelsList();
	res.send({ models });
}

export {
	handleSetModel,
	handleConfigureModel,
	handleGetModel,
	handleGetValidModels,
};
