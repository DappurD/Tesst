
import React from 'react';
import { useStore } from '../../store';

export const TestChamber = () => {
    const { startGame, closeModal } = useStore(state => state.actions);
    const bossList = useStore(state => state.bossList);

    return (
        <div id="test-chamber-modal" className="screen">
            <h1>Test Chamber</h1>
            <div className="test-mode-controls">
                <h2>Select a Boss to Practice Against</h2>
                {bossList.map((boss, index) => (
                    <button
                        key={boss.name}
                        onClick={() => startGame(true, index)}
                        aria-label={`Test ${boss.name}`}
                    >
                        Test {boss.name}
                    </button>
                ))}
            </div>
            <button className="close-test-chamber-button" aria-label="Close Test Chamber" onClick={closeModal}>
                Close
            </button>
        </div>
    );
};
