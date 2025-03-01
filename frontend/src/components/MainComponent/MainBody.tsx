import { useState } from 'react';

import ChatBox from '@src/components/ChatBox/ChatBox';
import ControlPanel from '@src/components/ControlPanel/ControlPanel';
import EmailBox from '@src/components/EmailBox/EmailBox';
import { ChatMessage } from '@src/models/chat';
import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

import './MainBody.css';

function MainBody({
	currentLevel,
	defences,
	emails,
	messages,
	chatModels,
	addChatMessage,
	addSentEmails,
	resetDefenceConfiguration,
	resetLevel,
	toggleDefence,
	setDefenceConfiguration,
	incrementNumCompletedLevels,
	openLevelsCompleteOverlay,
	openDocumentViewer,
}: {
	currentLevel: LEVEL_NAMES;
	defences: Defence[];
	emails: EmailInfo[];
	messages: ChatMessage[];
	chatModels: string[];
	addChatMessage: (message: ChatMessage) => void;
	addSentEmails: (emails: EmailInfo[]) => void;
	resetDefenceConfiguration: (defenceId: DEFENCE_ID, configId: string) => void;
	resetLevel: () => void;
	toggleDefence: (defence: Defence) => void;
	setDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) => Promise<boolean>;
	incrementNumCompletedLevels: (level: LEVEL_NAMES) => void;
	openLevelsCompleteOverlay: () => void;
	openDocumentViewer: () => void;
}) {
	const [completedLevels, setCompletedLevels] = useState<Set<LEVEL_NAMES>>(
		new Set()
	);

	function resetLevelBody() {
		completedLevels.delete(currentLevel);
		setCompletedLevels(completedLevels);
		resetLevel();
	}

	function addCompletedLevel(level: LEVEL_NAMES) {
		completedLevels.add(level);
		setCompletedLevels(completedLevels);
	}

	return (
		<main className="main-area">
			<div className="side-bar">
				<ControlPanel
					currentLevel={currentLevel}
					defences={defences}
					chatModelOptions={chatModels}
					toggleDefence={toggleDefence}
					resetDefenceConfiguration={resetDefenceConfiguration}
					setDefenceConfiguration={setDefenceConfiguration}
					openDocumentViewer={openDocumentViewer}
				/>
			</div>
			<div className="centre-area">
				<ChatBox
					completedLevels={completedLevels}
					currentLevel={currentLevel}
					emails={emails}
					messages={messages}
					addChatMessage={addChatMessage}
					addCompletedLevel={addCompletedLevel}
					addSentEmails={addSentEmails}
					resetLevel={resetLevelBody}
					incrementNumCompletedLevels={incrementNumCompletedLevels}
					openLevelsCompleteOverlay={openLevelsCompleteOverlay}
				/>
			</div>
			<div className="side-bar">
				<EmailBox emails={emails} />
			</div>
		</main>
	);
}

export default MainBody;
