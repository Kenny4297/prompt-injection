import GettingStarted from '@src/assets/icons/GettingStarted.svg';
import HandbookIcon from '@src/assets/icons/Handbook.svg';
import ResetProgress from '@src/assets/icons/ResetProgressIcon.svg';
import SpyLogicTitleLogo from '@src/assets/images/SpyLogicTitleLogo.svg';
import SpyLogicTitleLogoAffirmative from '@src/assets/images/SpyLogicTitleLogo_Affirmative.svg';
import LevelSelectionBox from '@src/components/LevelSelectionBox/LevelSelectionBox';
import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import { LEVEL_NAMES } from '@src/models/level';

import './MainHeader.css';

function MainHeader({
	currentLevel,
	numCompletedLevels,
	openHandbook,
	openResetProgress,
	openWelcome,
	setCurrentLevel,
}: {
	currentLevel: LEVEL_NAMES;
	numCompletedLevels: number;
	openHandbook: () => void;
	openResetProgress: () => void;
	openWelcome: () => void;
	setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
}) {
	const isLevelComplete = (currentLevel as number) < numCompletedLevels;

	return (
		<header className="main-header">
			<span className="main-header-left">
				<img
					className="titleLogo"
					src={
						isLevelComplete ? SpyLogicTitleLogoAffirmative : SpyLogicTitleLogo
					}
					alt="Spy Logic"
				/>
			</span>
			<span className="main-header-middle">
				<span className="main-header-level">Level</span>
				<LevelSelectionBox
					currentLevel={currentLevel}
					numCompletedLevels={numCompletedLevels}
					setCurrentLevel={setCurrentLevel}
				/>
				<ThemedButton onClick={openResetProgress}>
					<img className="reset-progress-icon" src={ResetProgress} alt="" />
					Reset Progress
				</ThemedButton>
			</span>
			<span className="main-header-right">
				<ThemedButton onClick={openWelcome}>
					<img src={GettingStarted} alt="" />
					Getting Started
				</ThemedButton>

				<ThemedButton onClick={openHandbook}>
					<img src={HandbookIcon} alt="" />
					Handbook
				</ThemedButton>
			</span>
		</header>
	);
}

export default MainHeader;
