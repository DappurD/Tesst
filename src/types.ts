

export type EntityType = 'player' | 'enemy' | 'boss' | 'playerBullet' | 'enemyBullet' | 'particle' | 'aoeZone' | 'obstacle' | 'interactable' | 'floatingText' | 'powerup' | 'singularity' | 'hazard';
export type PowerUpType = 'QuadShot' | 'RapidFire' | 'Shield';
export type GameState = 'Hub' | 'Playing' | 'BossIntro' | 'GameOver' | 'Victory' | 'UpgradeScreen' | 'TestChamber' | 'LoreScreen' | 'Intermission';

export interface Upgrades {
    health: number;
    fireRate: number;
    dashCooldown: number;
    damage: number;
    shards: number;
}

export interface PlayerState {
    health: number;
    maxHealth: number;
    ultimateCharge: number;
    maxUltimateCharge: number;
    activePowerups: Map<PowerUpType, number>;
    isLowHealth: boolean;
}

export interface BossState {
    name: string;
    health: number;
    maxHealth: number;
}

export interface SaveData {
    upgrades: Upgrades;
}

export interface PermanentUpgradeInfo {
    id: keyof Omit<Upgrades, 'shards'>;
    name: string;
    description: string;
    cost: (level: number) => number;
}

export interface IntermissionUpgradeInfo {
    id: string;
    name: string;
    description: string;
}