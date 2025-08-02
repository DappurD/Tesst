
import React from 'react';
import { useStore } from '../../store';
import { PERMANENT_UPGRADES } from '../../gameConfig';
import type { Upgrades } from '../../types';

export const ShardSynthesizer = () => {
    const upgrades = useStore(state => state.upgrades);
    const { purchasePermanentUpgrade, closeModal } = useStore(state => state.actions);

    return (
        <div id="shard-synthesizer-modal" className="screen shard-synthesizer-modal">
            <h1>Shard Synthesizer</h1>
            <p>Channel Void Shards to permanently enhance the Scornicorn's power.</p>
            <div className="synthesizer-content">
                <div className="synthesizer-shard-counter">
                    Available Shards: <span>{upgrades.shards}</span>
                </div>
                <div className="upgrade-list">
                    {PERMANENT_UPGRADES.map(upgradeInfo => {
                        const level = upgrades[upgradeInfo.id];
                        const cost = upgradeInfo.cost(level);
                        return (
                             <div key={upgradeInfo.id} className="upgrade-item">
                                <div><h3>{upgradeInfo.name}</h3></div>
                                <div><p>{upgradeInfo.description}</p></div>
                                <div className="upgrade-info">Level {level}</div>
                                <button
                                    className="upgrade-button"
                                    onClick={() => purchasePermanentUpgrade(upgradeInfo.id, cost)}
                                    disabled={upgrades.shards < cost}
                                >
                                    Buy ({cost} Shards)
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
            <button className="close-synthesizer-button" aria-label="Close Synthesizer" onClick={closeModal}>
                Close
            </button>
        </div>
    );
};
