import { create } from 'zustand';
import type { Game } from './game';
import type { GameState, Upgrades, PowerUpType, PermanentUpgradeInfo, IntermissionUpgradeInfo, PlayerState, BossState } from './types';
import { PERMANENT_UPGRADES } from './gameConfig';

interface SanctumState {
    isQuerying: boolean;
    response: string;
}

interface WaveInfo {
    stage: number;
    wave: number;
    totalWaves: number;
    show: boolean;
}

interface StoreState {
    game: Game | null;
    gameState: GameState;
    playerState: PlayerState | null;
    bossState: BossState | null;
    upgrades: Upgrades;
    interactionPrompt: { text: string; show: boolean };
    waveInfo: WaveInfo;
    intermissionUpgrades: IntermissionUpgradeInfo[];
    sanctumState: SanctumState;
    bossList: { name: string }[];
}

interface Actions {
    setGame: (game: Game) => void;
    setState: (newState: Partial<StoreState>) => void;
    
    // Game Actions accessible by UI
    startGame: (isTest: boolean, bossIndex?: number) => void;
    returnToHub: () => void;
    startNextStage: () => void;
    purchasePermanentUpgrade: (id: keyof Omit<Upgrades, 'shards'>, cost: number) => void;
    selectIntermissionUpgrade: (upgrade: IntermissionUpgradeInfo) => void;
    querySanctum: (query: string) => void;
    closeModal: () => void;
}

export const useStore = create<StoreState & { actions: Actions }>((set, get) => ({
    game: null,
    gameState: 'Hub',
    playerState: null,
    bossState: null,
    upgrades: { health: 0, fireRate: 0, dashCooldown: 0, damage: 0, shards: 0 },
    interactionPrompt: { text: '', show: false },
    waveInfo: { stage: 0, wave: 0, totalWaves: 0, show: false },
    intermissionUpgrades: [],
    sanctumState: { isQuerying: false, response: '' },
    bossList: [],

    actions: {
        setGame: (game) => set({ game }),
        setState: (newState) => set(newState),

        startGame: (isTest, bossIndex = 0) => get().game?.startNewGame(isTest, bossIndex),
        returnToHub: () => get().game?.enterHub(),
        startNextStage: () => get().game?.startNextStage(),
        purchasePermanentUpgrade: (id, cost) => get().game?.purchasePermanentUpgrade(id, cost),
        selectIntermissionUpgrade: (upgrade) => {
            get().game?.applyIntermissionUpgrade(upgrade.id);
        },
        querySanctum: (query) => get().game?.querySanctum(query),
        closeModal: () => get().game?.setGameState('Hub'),
    }
}));
