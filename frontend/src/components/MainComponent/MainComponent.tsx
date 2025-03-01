import { useEffect, useState } from 'react';

import { ALL_DEFENCES, DEFENCES_SHOWN_LEVEL3 } from '@src/Defences';
import LevelMissionInfoBanner from '@src/components/LevelMissionInfoBanner/LevelMissionInfoBanner';
import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';
import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';
import {
	addMessageToChatHistory,
	clearChat,
	getChatHistory,
} from '@src/service/chatService';
import {
	toggleDefence,
	configureDefence,
	getDefences,
	resetActiveDefences,
	resetDefenceConfig,
} from '@src/service/defenceService';
import { clearEmails, getSentEmails } from '@src/service/emailService';
import { healthCheck } from '@src/service/healthService';

import MainBody from './MainBody';
import MainFooter from './MainFooter';
import MainHeader from './MainHeader';

import './MainComponent.css';

function MainComponent({
	currentLevel,
	numCompletedLevels,
	chatModels,
	incrementNumCompletedLevels,
	openHandbook,
	openInformationOverlay,
	openLevelsCompleteOverlay,
	openWelcomeOverlay,
	openResetProgressOverlay,
	openDocumentViewer,
	setCurrentLevel,
}: {
	currentLevel: LEVEL_NAMES;
	numCompletedLevels: number;
	chatModels: string[];
	incrementNumCompletedLevels: (level: number) => void;
	openHandbook: () => void;
	openInformationOverlay: () => void;
	openLevelsCompleteOverlay: () => void;
	openWelcomeOverlay: () => void;
	openResetProgressOverlay: () => void;
	openDocumentViewer: () => void;
	setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
}) {
	const [MainBodyKey, setMainBodyKey] = useState<number>(0);
	const [defencesToShow, setDefencesToShow] = useState<Defence[]>(ALL_DEFENCES);
	const [emails, setEmails] = useState<EmailInfo[]>([]);
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	// called on mount
	useEffect(() => {
		// perform backend health check
		healthCheck().catch(() => {
			// addErrorMessage('Failed to reach the server. Please try again later.');
			setMessages([
				{
					message: 'Failed to reach the server. Please try again later.',
					type: CHAT_MESSAGE_TYPE.ERROR_MSG,
				},
			]);
		});
	}, []);

	useEffect(() => {
		void setNewLevel(currentLevel);
	}, [currentLevel]);

	// methods to modify messages
	function addChatMessage(message: ChatMessage) {
		setMessages((messages: ChatMessage[]) => [...messages, message]);
	}

	function addSentEmails(newEmails: EmailInfo[]) {
		setEmails(emails.concat(newEmails));
	}

	function getResetDefences(currentLevel: LEVEL_NAMES): Defence[] {
		// choose appropriate defences to display
		let defences =
			currentLevel === LEVEL_NAMES.LEVEL_3
				? DEFENCES_SHOWN_LEVEL3
				: ALL_DEFENCES;
		defences = defences.map((defence) => {
			defence.isActive = false;
			return defence;
		});
		return defences;
	}

	function resetFrontendState() {
		setMessages([]);
		setEmails([]);
		setDefencesToShow(getResetDefences(currentLevel));
		if (currentLevel !== LEVEL_NAMES.SANDBOX) {
			setMessagesWithWelcome([]);
		}
	}
	// for clearing single level progress
	async function resetLevel() {
		// reset on the backend
		await Promise.all([
			clearChat(currentLevel),
			clearEmails(currentLevel),
			resetActiveDefences(currentLevel),
		]);

		resetFrontendState();
		addResetMessage();
	}

	// for going switching level without clearing progress
	async function setNewLevel(newLevel: LEVEL_NAMES) {
		// get emails for new level from the backend
		setEmails(await getSentEmails(newLevel));

		// get chat history for new level from the backend
		const retrievedMessages = await getChatHistory(newLevel);

		// add welcome message for levels only
		newLevel !== LEVEL_NAMES.SANDBOX
			? setMessagesWithWelcome(retrievedMessages)
			: setMessages(retrievedMessages);

		const defences =
			newLevel === LEVEL_NAMES.LEVEL_3 ? DEFENCES_SHOWN_LEVEL3 : ALL_DEFENCES;
		// fetch defences from backend
		const remoteDefences = await getDefences(newLevel);
		defences.map((localDefence) => {
			const matchingRemoteDefence = remoteDefences.find((remoteDefence) => {
				return localDefence.id === remoteDefence.id;
			});
			if (matchingRemoteDefence) {
				localDefence.isActive = matchingRemoteDefence.isActive;
				// set each config value
				matchingRemoteDefence.config.forEach((configEntry) => {
					// get the matching config in the local defence
					const matchingConfig = localDefence.config.find((config) => {
						return config.id === configEntry.id;
					});
					if (matchingConfig) {
						matchingConfig.value = configEntry.value;
					}
				});
			}
			return localDefence;
		});
		setDefencesToShow(defences);
		setMainBodyKey(MainBodyKey + 1);
	}

	function addInfoMessage(message: string) {
		addChatMessage({
			message,
			type: CHAT_MESSAGE_TYPE.INFO,
		});
		// asynchronously add message to chat history
		void addMessageToChatHistory(message, CHAT_MESSAGE_TYPE.INFO, currentLevel);
	}

	async function resetDefenceConfiguration(
		defenceId: DEFENCE_ID,
		configId: string
	) {
		const resetDefence = await resetDefenceConfig(defenceId, configId);
		// update state
		const newDefences = defencesToShow.map((defence) => {
			if (defence.id === defenceId) {
				defence.config.forEach((config) => {
					if (config.id === configId) {
						config.value = resetDefence.value.trim();
					}
				});
			}
			return defence;
		});
		setDefencesToShow(newDefences);
	}

	async function setDefenceToggle(defence: Defence) {
		await toggleDefence(defence.id, defence.isActive, currentLevel);

		const newDefenceDetails = defencesToShow.map((defenceDetail) => {
			if (defenceDetail.id === defence.id) {
				defenceDetail.isActive = !defence.isActive;
				const action = defenceDetail.isActive ? 'activated' : 'deactivated';
				const infoMessage = `${defence.name} defence ${action}`;
				addInfoMessage(infoMessage.toLowerCase());
			}
			return defenceDetail;
		});

		setDefencesToShow(newDefenceDetails);
	}

	async function setDefenceConfiguration(
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) {
		const success = await configureDefence(defenceId, config, currentLevel);
		if (success) {
			// update state
			const newDefences = defencesToShow.map((defence) => {
				if (defence.id === defenceId) {
					defence.config = config;
				}
				return defence;
			});
			setDefencesToShow(newDefences);
		}
		return success;
	}

	function setMessagesWithWelcome(retrievedMessages: ChatMessage[]) {
		const welcomeMessage: ChatMessage = {
			message: `Hello! I'm ScottBrewBot, your personal AI work assistant. You can ask me for information or to help you send emails. What can I do for you?`,
			type: CHAT_MESSAGE_TYPE.BOT,
		};
		// if reset level add welcome into second position, otherwise add to first
		if (retrievedMessages.length === 0) {
			setMessages([welcomeMessage]);
		} else if (retrievedMessages[0].type === CHAT_MESSAGE_TYPE.RESET_LEVEL) {
			retrievedMessages.splice(1, 0, welcomeMessage);
			setMessages(retrievedMessages);
		} else {
			setMessages([welcomeMessage, ...retrievedMessages]);
		}
	}

	function addResetMessage() {
		const resetMessage: ChatMessage = {
			message: `Level progress reset`,
			type: CHAT_MESSAGE_TYPE.RESET_LEVEL,
		};
		void addMessageToChatHistory(
			resetMessage.message,
			resetMessage.type,
			currentLevel
		);
		setMessages((messages: ChatMessage[]) => [resetMessage, ...messages]);
	}

	return (
		<div className="main-component">
			<MainHeader
				currentLevel={currentLevel}
				numCompletedLevels={numCompletedLevels}
				openHandbook={openHandbook}
				openResetProgress={openResetProgressOverlay}
				openWelcome={openWelcomeOverlay}
				setCurrentLevel={setCurrentLevel}
			/>
			{currentLevel !== LEVEL_NAMES.SANDBOX && (
				<LevelMissionInfoBanner
					currentLevel={currentLevel}
					openOverlay={openInformationOverlay}
				/>
			)}
			<MainBody
				key={MainBodyKey}
				currentLevel={currentLevel}
				defences={defencesToShow}
				chatModels={chatModels}
				emails={emails}
				messages={messages}
				addChatMessage={addChatMessage}
				addSentEmails={addSentEmails}
				resetDefenceConfiguration={(defenceId: DEFENCE_ID, configId: string) =>
					void resetDefenceConfiguration(defenceId, configId)
				}
				resetLevel={() => void resetLevel()}
				toggleDefence={(defence: Defence) => void setDefenceToggle(defence)}
				setDefenceConfiguration={setDefenceConfiguration}
				incrementNumCompletedLevels={incrementNumCompletedLevels}
				openLevelsCompleteOverlay={openLevelsCompleteOverlay}
				openDocumentViewer={openDocumentViewer}
			/>
			<MainFooter />
		</div>
	);
}

export default MainComponent;
