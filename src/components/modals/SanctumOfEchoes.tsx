import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store';

export const SanctumOfEchoes = () => {
    const { isQuerying, response } = useStore(state => state.sanctumState);
    const { querySanctum, closeModal } = useStore(state => state.actions);
    const [inputValue, setInputValue] = useState('');
    const [displayedResponse, setDisplayedResponse] = useState('');
    const responseAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // When a new query starts, clear the old response.
        if (isQuerying) {
             setDisplayedResponse('');
        }
    }, [isQuerying]);
    
    useEffect(() => {
        // Typewriter effect should only run after the query is complete.
        if (!isQuerying && response && displayedResponse.length < response.length) {
            const timer = setTimeout(() => {
                setDisplayedResponse(response.substring(0, displayedResponse.length + 1));
            }, 25);
            return () => clearTimeout(timer);
        }
    }, [isQuerying, response, displayedResponse]);
    
    useEffect(() => {
        // Auto-scroll the response area as text is added.
        if(responseAreaRef.current) {
            responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
        }
    }, [displayedResponse]);

    const handleQuery = () => {
        // Prevent sending a new query while one is already in progress.
        if (inputValue.trim() && !isQuerying) {
            querySanctum(inputValue.trim());
            setInputValue('');
        }
    };

    const isTyping = !isQuerying && response && displayedResponse.length < response.length;

    return (
        <div id="sanctum-modal" className="screen sanctum-modal">
            <h1>Sanctum of Echoes</h1>
            <p>Peer into the void. Ask about the world, its denizens, or the secrets of the Scornicorn.</p>
            {isQuerying && displayedResponse.length === 0 && <div className="sanctum-loading">Consulting the Void...</div>}
            <div className="sanctum-content">
                <div ref={responseAreaRef} className="sanctum-response-area">
                    <span>{isQuerying ? response : displayedResponse}</span>
                    {!isQuerying && !isTyping && response && <span className="sanctum-cursor"></span>}
                </div>
                <div className="sanctum-input-container">
                    <input
                        type="text"
                        className="sanctum-input"
                        placeholder="Ask a question..."
                        aria-label="Your question for the Sanctum"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyUp={(e) => e.key === 'Enter' && handleQuery()}
                        disabled={isQuerying}
                    />
                    <button
                        className="sanctum-query-button"
                        aria-label="Query the Void"
                        onClick={handleQuery}
                        disabled={isQuerying || !inputValue.trim()}
                    >
                        Query
                    </button>
                </div>
            </div>
            <button className="close-sanctum-button" aria-label="Close Sanctum" onClick={closeModal}>
                Close
            </button>
        </div>
    );
};
