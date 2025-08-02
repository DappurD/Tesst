import React from 'react';
import { useStore } from '../store';

export const InteractionPrompt = () => {
    const { text, show } = useStore(state => state.interactionPrompt);

    if (!show) {
        return null;
    }

    return (
        <div className="interaction-prompt">
            {text}
        </div>
    );
};
