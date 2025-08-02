import React from 'react';
import { useStore } from '../store';
import { HUD } from './HUD';
import { InteractionPrompt } from './InteractionPrompt';
import { GameOverScreen, VictoryScreen, IntermissionScreen, ShardSynthesizer, TestChamber, SanctumOfEchoes } from './modals';

export const UI = () => {
    const gameState = useStore(state => state.gameState);
    const isLowHealth = useStore(state => state.playerState?.isLowHealth ?? false);

    const showHud = gameState === 'Playing' || gameState === 'BossIntro' || gameState === 'Hub';
    
    return (
        <div id="ui-overlay" className={isLowHealth && gameState !== 'Hub' ? 'low-health' : ''}>
            {showHud && <HUD />}
            {gameState === 'Hub' && <InteractionPrompt />}
            
            {gameState === 'GameOver' && <GameOverScreen />}
            {gameState === 'Victory' && <VictoryScreen />}
            {gameState === 'Intermission' && <IntermissionScreen />}
            {gameState === 'UpgradeScreen' && <ShardSynthesizer />}
            {gameState === 'TestChamber' && <TestChamber />}
            {gameState === 'LoreScreen' && <SanctumOfEchoes />}
        </div>
    );
};
