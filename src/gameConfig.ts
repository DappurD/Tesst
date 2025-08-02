import { PermanentUpgradeInfo, IntermissionUpgradeInfo } from './types';

// Stage and Wave Configuration
export const STAGES = [
    { name: "Cybernetic Grasslands", waves: [{e:8,i:2},{e:10,i:1.5},{e:12,i:1}], bossId: 'CyberStallion' },
    { name: "The Hive's Nest", waves: [{e:12,i:1.5},{e:15,i:1.2},{e:18,i:0.9}], bossId: 'SwarmSovereign' },
    { name: "Corrupted Datascape", waves: [{e:15,i:1.2},{e:18,i:1},{e:20,i:0.8}], bossId: 'GlitchEntity' },
    { name: "The Molten Heart", waves: [{e:15,i:1.2},{e:20,i:1},{e:25, i:0.7}], bossId: 'ForgeMaster' },
    { name: "Crystalline Caverns", waves: [{e:18,i:1.1},{e:22,i:0.9},{e:28,i:0.7}], bossId: 'CrystalWeaver' },
    { name: "Abyssal Trench", waves: [{e:20,i:1},{e:25,i:0.8},{e:30,i:0.6}], bossId: 'SunkenHorror' },
    { name: "Edge of Infinity", waves: [{e:30,i:0.8},{e:40,i:0.6},{e:50,i:0.5}], bossId: 'VoidTitan' },
];

export const PERMANENT_UPGRADES: PermanentUpgradeInfo[] = [
    { id: 'health', name: 'Reinforced Hull', description: 'Increases max health by 2.', cost: (level: number) => 25 + level * 25 },
    { id: 'damage', name: 'Weapon Calibration', description: 'Increases base damage by 25%.', cost: (level: number) => 40 + level * 40 },
    { id: 'fireRate', name: 'Optimized Firing Sequencer', description: 'Increases base fire rate by 15%.', cost: (level: number) => 40 + level * 40 },
    { id: 'dashCooldown', name: 'Engine Overcharge', description: 'Reduces dash cooldown by 10%.', cost: (level: number) => 30 + level * 30 },
];

export const INTERMISSION_UPGRADES: IntermissionUpgradeInfo[] = [
    { id: 'tempHealth', name: 'Nanorepair Swarm', description: 'Increase max health by 5 for this stage.' },
    { id: 'tempDamage', name: 'Focused Energy', description: 'Increase damage by 20% for this stage.' },
    { id: 'tempFireRate', name: 'Rapid Cycling', description: 'Increase fire rate by 25% for this stage.' },
    { id: 'piercing', name: 'Void-Tipped Rounds', description: 'Your bullets now pierce through enemies.' },
];
