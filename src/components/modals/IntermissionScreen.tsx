import React from 'react';
import { useStore } from '../../store';
import type { IntermissionUpgradeInfo } from '../../types';

export const IntermissionScreen = () => {
    const shards = useStore(state => state.upgrades.shards);
    const upgrades = useStore(state => state.intermissionUpgrades);
    const { selectIntermissionUpgrade, startNextStage } = useStore(state => state.actions);

    return (
        <div id="intermission-screen" className="screen intermission-screen">
            <h1>STAGE CLEARED</h1>
            <p>The void recedes. Reinforce your power before plunging deeper.</p>
            <div className="intermission-content">
                <div className="intermission-shard-counter">
                    Available Shards: <span>{shards}</span>
                </div>
                <div className="intermission-upgrade-list">
                    {upgrades.map(upgrade => (
                        <div key={upgrade.id} className="upgrade-item">
                            <div style={{ gridColumn: '1 / 4' }}>
                                <h3>{upgrade.name}</h3>
                                <p>{upgrade.description}</p>
                            </div>
                            <button className="upgrade-button" onClick={() => selectIntermissionUpgrade(upgrade)}>
                                Select
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <button className="proceed-button" onClick={startNextStage}>
                Proceed to Next Stage
            </button>
        </div>
    );
};