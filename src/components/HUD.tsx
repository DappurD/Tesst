
import React from 'react';
import { useStore } from '../store';
import type { PowerUpType } from '../types';

const PowerUpIcon = ({ type, timer }: { type: PowerUpType, timer: number }) => {
    let letter = '';
    if (type === 'QuadShot') letter = 'Q';
    if (type === 'RapidFire') letter = 'R';
    if (type === 'Shield') letter = 'S';
    return <div className="power-up-icon">{`${letter} ${Math.ceil(timer)}`}</div>;
};

export const HUD = () => {
    const playerState = useStore(state => state.playerState);
    const bossState = useStore(state => state.bossState);
    const shards = useStore(state => state.upgrades.shards);
    const waveInfo = useStore(state => state.waveInfo);

    const playerHealthPercent = playerState ? (playerState.health / playerState.maxHealth) * 100 : 0;
    const ultimatePercent = playerState ? (playerState.ultimateCharge / playerState.maxUltimateCharge) * 100 : 0;
    const bossHealthPercent = bossState ? (bossState.health / bossState.maxHealth) * 100 : 0;

    return (
        <div className="hud">
            {playerState && (
                 <div className="player-hud-left">
                    <div className="health-bar-container player-health-container">
                        <label>SCORNICORN</label>
                        <div id="player-health-bar" className="health-bar">
                            <div className="player-health-bar-fill" style={{ width: `${playerHealthPercent}%` }}></div>
                        </div>
                    </div>
                     <div className="health-bar-container ultimate-bar-container">
                        <label>SINGULARITY [Q]</label>
                        <div id="ultimate-bar" className="health-bar ultimate-bar">
                            <div className={`ultimate-bar-fill ${ultimatePercent >= 100 ? 'full' : ''}`} style={{ width: `${ultimatePercent}%` }}></div>
                        </div>
                    </div>
                     <div className="shard-display-container">
                        <label>VOID SHARDS</label>
                        <span className="shard-count">{shards}</span>
                    </div>
                    <div className="power-up-container">
                        {playerState && Array.from(playerState.activePowerups.entries()).map(([type, timer]: [PowerUpType, number]) => (
                            <PowerUpIcon key={type} type={type} timer={timer} />
                        ))}
                    </div>
                </div>
            )}
            {bossState && (
                <div className="health-bar-container boss-health-container">
                    <label>{bossState.name.toUpperCase()}</label>
                    <div id="boss-health-bar" className="health-bar">
                        <div className="boss-health-bar-fill" style={{ width: `${bossHealthPercent}%` }}></div>
                    </div>
                </div>
            )}
            {waveInfo.show && (
                <div className="wave-info">
                    <span>STAGE {waveInfo.stage}</span>
                    <span>{waveInfo.wave === -1 ? 'BOSS' : `WAVE ${waveInfo.wave} / ${waveInfo.totalWaves}`}</span>
                </div>
            )}
        </div>
    );
};