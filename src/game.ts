
import { InputHandler, SoundManager } from './managers';

// Direct entity imports to break circular dependency with barrel files
import { Entity } from './entities/Entity';
import { Player } from './entities/Player';
import { Bullet } from './entities/Bullet';
import { Particle } from './entities/effects/Particle';
import { FloatingText } from './entities/effects/FloatingText';
import { Boss } from './entities/bosses/Boss';
import { CyberStallion } from './entities/bosses/CyberStallion';
import { SwarmSovereign } from './entities/bosses/SwarmSovereign';
import { GlitchEntity } from './entities/bosses/GlitchEntity';
import { ForgeMaster } from './entities/bosses/ForgeMaster';
import { CrystalWeaver } from './entities/bosses/CrystalWeaver';
import { SunkenHorror } from './entities/bosses/SunkenHorror';
import { VoidTitan } from './entities/bosses/VoidTitan';
import { Interactable } from './entities/interactables/Interactable';
import { VoidPortal } from './entities/interactables/VoidPortal';
import { TestConsole } from './entities/interactables/TestConsole';
import { ShardSynthesizer } from './entities/interactables/ShardSynthesizer';
import { SanctumOfEchoes } from './entities/interactables/SanctumOfEchoes';
import { Enemy } from './entities/enemies/Enemy';
import { PowerUp } from './entities/PowerUp';
import { Singularity } from './entities/Singularity';
import { LavaPool } from './entities/hazards/LavaPool';
import { InkPool } from './entities/hazards/InkPool';
import { LaserBeam } from './entities/hazards/LaserBeam';
import { CrystalObstacle } from './entities/obstacles/CrystalObstacle';


import { GameState, Upgrades, EntityType, PowerUpType, SaveData, IntermissionUpgradeInfo } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config';
import { rand, checkCollision, intersectLineRectangle, reflect, getSqDistToSegment } from './utils';
import { Starfield } from './visuals/Starfield';
import { GoogleGenAI } from '@google/genai';
import { STAGES, INTERMISSION_UPGRADES } from './gameConfig';

const bossConstructors = [
    CyberStallion, SwarmSovereign, GlitchEntity, 
    ForgeMaster, CrystalWeaver, SunkenHorror, VoidTitan
];

const bossMap: { [key: string]: new (x: number, y: number, game: Game) => Boss } = {
    'CyberStallion': CyberStallion,
    'SwarmSovereign': SwarmSovereign,
    'GlitchEntity': GlitchEntity,
    'ForgeMaster': ForgeMaster,
    'CrystalWeaver': CrystalWeaver,
    'SunkenHorror': SunkenHorror,
    'VoidTitan': VoidTitan
};

const intermissionApplyMap: { [key: string]: (p: Player) => void } = {
    'tempHealth': (p: Player) => p.tempHealthBonus += 5,
    'tempDamage': (p: Player) => p.tempDamageBonus += 0.2,
    'tempFireRate': (p: Player) => p.tempFireRateBonus += 0.25,
    'piercing': (p: Player) => p.hasPiercing = true,
};

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    backgroundCanvas: HTMLCanvasElement;
    input: InputHandler;
    soundManager: SoundManager;
    starfield: Starfield;
    
    private setState: (newState: Partial<any>) => void;
    
    entityMap: Record<EntityType, Entity[]> = this.getEmptyEntityMap();
    
    player: Player | null = null;
    currentBoss: Boss | null = null;
    upgrades: Upgrades;
    
    shardsEarnedThisRun = 0;
    
    gravityWell: { x: number, y: number, radius: number, strength: number } | null = null;
    
    screenShake = { intensity: 0, duration: 0, timer: 0 };
    lastTime = 0;
    gameState: GameState;

    currentStage: number = -1;
    currentWave: number = -1;
    waveSpawnTimer: number = 0;
    waveEnemiesToSpawn: number = 0;
    
    bossIntroTimer = 0;
    isTestMode = false;
    
    constructor(canvas: HTMLCanvasElement, setState: (newState: Partial<any>) => void) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.backgroundCanvas = document.getElementById('background-canvas') as HTMLCanvasElement;
        this.backgroundCanvas.width = CANVAS_WIDTH;
        this.backgroundCanvas.height = CANVAS_HEIGHT;
        this.starfield = new Starfield(300, this.backgroundCanvas);

        this.input = new InputHandler();
        this.soundManager = new SoundManager();
        this.setState = setState;
        this.gameState = 'Hub'; // Game class is the source of truth

        this.upgrades = { health: 0, fireRate: 0, dashCooldown: 0, damage: 0, shards: 0 };
        this.loadGame();
        
        this.setState({
            bossList: bossConstructors.map(bc => ({ name: bc.name.replace(/([A-Z])/g, ' $1').trim() }))
        });

        this.canvas.addEventListener('click', () => this.canvas.focus());
        this.canvas.focus();
        this.enterHub();
    }
    
    private getEmptyEntityMap(): Record<EntityType, Entity[]> {
        return {
            player: [], playerBullet: [], enemy: [], enemyBullet: [], boss: [], 
            particle: [], aoeZone: [], obstacle: [], interactable: [], floatingText: [],
            powerup: [], singularity: [], hazard: []
        };
    }

    public setGameState(newState: GameState) {
        this.gameState = newState;
        this.setState({ gameState: newState });
    }
    
    addEntity(entity: Entity) {
        this.entityMap[entity.type].push(entity);
    }
    
    addParticle(x: number, y: number, color: string | 'rainbow') {
        const count = color === 'rainbow' ? 20 : 5;
        for (let i = 0; i < count; i++) {
            this.addEntity(new Particle(x, y, color));
        }
    }
    
    triggerScreenShake(intensity: number, duration: number) {
        this.screenShake = { intensity, duration, timer: duration };
    }
    
    triggerPhaseTransition(boss: Boss, isSecondPhase: boolean) {
        boss.isTransitioning = true;
        boss.transitionTimer = 2.0;
        boss.invincible = true;
        this.soundManager.playBossTransition();
        this.triggerScreenShake(20, 2.0);
        this.addEntity(new FloatingText(boss.x + boss.width / 2, boss.y - 40, "PHASE " + (isSecondPhase ? "2" : "3"), '#ff0000', 32));
    }
    
    start() {
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    gameLoop(timestamp: number) {
        const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();
        this.updateStoreState(dt);

        this.input.clearPressedKeys();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(dt: number) {
        if(this.screenShake.timer > 0) this.screenShake.timer -= dt;
        
        const playerVelocity = this.player ? {vx: this.player.vx, vy: this.player.vy} : {vx: 0, vy: 0};
        this.starfield.update(dt, playerVelocity);
        
        const activeStates: GameState[] = ['Hub', 'Playing', 'BossIntro'];
        if (activeStates.includes(this.gameState)) {
            if (this.gameState === 'Hub') this.updateHub(dt); 
            else this.updatePlaying(dt);
        }

        for (const type in this.entityMap) {
            const initialCount = this.entityMap[type as EntityType].length;
            this.entityMap[type as EntityType] = this.entityMap[type as EntityType].filter(e => !e.shouldBeRemoved);
            
            if (type === 'boss' && initialCount > 0 && this.entityMap.boss.length === 0 && this.currentBoss) {
                if((this.currentBoss as Boss).name !== 'clone') {
                    this.currentBoss = null;
                    if (this.isTestMode) {
                        this.soundManager.stopMusic();
                        this.entityMap.enemyBullet = [];
                        this.enterHub();
                        this.setGameState('TestChamber');
                    } else {
                        this.showIntermissionScreen();
                    }
                }
            }
        }
    }
    
    updatePlaying(dt: number) {
        if (!this.player) return;

        // --- UPDATE ALL ENTITIES ---
        this.player.update(dt, this.input, this);
        
        (this.entityMap.enemy as Enemy[]).forEach(e => e.update(dt, this.player!, this));
        (this.entityMap.boss as Boss[]).forEach(e => e.update(dt, this.player!, this));
        (this.entityMap.playerBullet as Bullet[]).forEach(e => e.update(dt, this));
        (this.entityMap.enemyBullet as Bullet[]).forEach(e => e.update(dt, this));
        (this.entityMap.obstacle as CrystalObstacle[]).forEach(e => e.update(dt, this));
        (this.entityMap.particle as Particle[]).forEach(e => e.update(dt, this));
        (this.entityMap.floatingText as FloatingText[]).forEach(e => e.update(dt));
        (this.entityMap.powerup as PowerUp[]).forEach(e => e.update(dt));
        (this.entityMap.singularity as Singularity[]).forEach(e => e.update(dt, this));
        (this.entityMap.hazard as (LavaPool | InkPool | LaserBeam)[]).forEach(e => e.update(dt));

        this.handleCollisions(dt);
        
        if (this.gameState === 'BossIntro') {
            this.updateBossIntro(dt);
        } else if (this.gameState === 'Playing') {
            if (this.waveEnemiesToSpawn > 0) {
                this.waveSpawnTimer -= dt;
                if (this.waveSpawnTimer <= 0) {
                    this.waveEnemiesToSpawn--;
                    const spawnEdge = Math.floor(rand(0, 4));
                    let x, y;
                    if (spawnEdge === 0) { x = rand(0, CANVAS_WIDTH); y = -50; }
                    else if (spawnEdge === 1) { x = CANVAS_WIDTH + 50; y = rand(0, CANVAS_HEIGHT); }
                    else if (spawnEdge === 2) { x = rand(0, CANVAS_WIDTH); y = CANVAS_HEIGHT + 50; }
                    else { x = -50; y = rand(0, CANVAS_HEIGHT); }
                    this.addEntity(new Enemy(x, y));
                    
                    this.waveSpawnTimer = this.getStageConfig().waves[this.currentWave].i;
                }
            }
            else if (this.entityMap.enemy.length === 0 && !this.currentBoss) {
                this.currentWave++;
                this.startNextWave();
            }
        }
        
        if (this.player.shouldBeRemoved) {
            // Player death sequence
            this.triggerScreenShake(25, 0.5);
            for(let i=0; i<100; i++) this.addParticle(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 'rainbow');
            this.entityMap.player = [];
            this.player = null;

            setTimeout(() => {
                 if (this.isTestMode) {
                    this.soundManager.stopMusic();
                    this.enterHub();
                    this.setGameState('TestChamber');
                } else {
                    this.showGameOverScreen();
                }
            }, 1000);
        }
    }
    
    updateHub(dt: number) {
        if (!this.player) return;
        this.player.update(dt, this.input, this);
        
        // Find closest interactable
        let closest: Interactable | null = null;
        let minDistanceSq = Infinity;
        for (const i of this.entityMap.interactable) {
            const interactable = i as Interactable;
            interactable.isHighlighted = false;
            const distSq = (interactable.x + interactable.width / 2 - (this.player.x + this.player.width / 2)) ** 2 + (interactable.y + interactable.height / 2 - (this.player.y + this.player.height / 2)) ** 2;
            if (distSq < interactable.interactionRadius ** 2 && distSq < minDistanceSq) {
                minDistanceSq = distSq;
                closest = interactable;
            }
        }

        if (closest) {
            closest.isHighlighted = true;
            this.setState({ interactionPrompt: { text: closest.promptText, show: true } });
            if (this.input.keysPressed.has('KeyE')) {
                this.soundManager.playUIClick();
                closest.onInteract(this);
            }
        } else {
            this.setState({ interactionPrompt: { text: '', show: false } });
        }
    }
    
    updateBossIntro(dt: number) {
        this.bossIntroTimer -= dt;
        if (this.bossIntroTimer <= 0) {
            this.setGameState('Playing');
            if(this.currentBoss) this.currentBoss.invincible = false;
        }
    }
    
    handleCollisions(dt: number) {
        if (!this.player) return;

        // Player bullets vs Enemies/Bosses
        for (const bullet of this.entityMap.playerBullet as Bullet[]) {
            if (bullet.shouldBeRemoved) continue;
            const targets = [...this.entityMap.enemy, ...this.entityMap.boss];
            for (const target of targets) {
                if (target.health <= 0 || target.invincible) continue;
                if (checkCollision(bullet, target)) {
                    const damage = bullet.damage;
                    target.health -= damage;
                    this.addEntity(new FloatingText(target.x + target.width/2, target.y, damage.toFixed(1).replace(/\.0$/,'')));
                    this.player.addUltimateCharge(1);
                    
                    if (target.health <= 0) {
                        target.shouldBeRemoved = true;
                        this.soundManager.playExplosion();
                        for(let i=0; i<20; i++) this.addParticle(target.x + target.width/2, target.y + target.height/2, '#ff4141');
                        if (target.type === 'boss') {
                             if((target as Boss).name !== 'clone')
                                this.shardsEarnedThisRun += (target as Boss).shardValue;
                        } else if (target.type === 'enemy') {
                            this.shardsEarnedThisRun += 1;
                            if(Math.random() < 0.1) {
                                const powerUpTypes: PowerUpType[] = ['QuadShot', 'RapidFire', 'Shield'];
                                const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                                this.addEntity(new PowerUp(target.x, target.y, type));
                            }
                        }
                    } else {
                        this.soundManager.playHit();
                    }
                    if (!bullet.hasPiercing) {
                        bullet.shouldBeRemoved = true;
                        break;
                    }
                }
            }
        }
        
        // Player bullets vs Obstacles
        for (const bullet of this.entityMap.playerBullet as Bullet[]) {
            if (bullet.shouldBeRemoved) continue;
            for (const obstacle of this.entityMap.obstacle as CrystalObstacle[]) {
                if (obstacle.health <= 0) continue;
                if (checkCollision(bullet, obstacle)) {
                    if (!obstacle.invincible) {
                        obstacle.health -= bullet.damage;
                        this.addEntity(new FloatingText(obstacle.x + obstacle.width/2, obstacle.y, bullet.damage.toFixed(1).replace(/\.0$/,'')));
                        this.addParticle(bullet.x, bullet.y, '#dddddd');
                        if (obstacle.health <= 0) {
                            obstacle.shouldBeRemoved = true;
                            this.soundManager.playExplosion();
                            for(let i=0; i<20; i++) this.addParticle(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, '#dddddd');
                        }
                    }
                    
                    if (bullet.ricochetCount > 0) {
                        const intersection = intersectLineRectangle(
                            { x: bullet.x - bullet.vx * dt, y: bullet.y - bullet.vy * dt },
                            { x: bullet.x + bullet.width/2, y: bullet.y + bullet.height/2 },
                            obstacle
                        );
                        if (intersection) {
                            bullet.ricochetCount--;
                            const incident = { x: bullet.vx, y: bullet.vy };
                            const reflected = reflect(incident, intersection.normal);
                            bullet.vx = reflected.x;
                            bullet.vy = reflected.y;
                            bullet.x = intersection.x;
                            bullet.y = intersection.y;
                            this.soundManager.playHit();
                        } else if (!bullet.hasPiercing) {
                            bullet.shouldBeRemoved = true;
                        }
                    } else if (!bullet.hasPiercing) {
                        bullet.shouldBeRemoved = true;
                    }
                    if (bullet.shouldBeRemoved) break;
                }
            }
        }
        
        // Enemy bullets vs Player
        for (const bullet of this.entityMap.enemyBullet) {
            if (this.player && checkCollision(bullet, this.player)) {
                if (this.player.takeDamage((bullet as Bullet).damage, this)) {
                    bullet.shouldBeRemoved = true;
                }
            }
        }

        // Enemy bullets vs Obstacles
        for (const bullet of this.entityMap.enemyBullet as Bullet[]) {
            if (bullet.shouldBeRemoved) continue;
            for (const obstacle of this.entityMap.obstacle as CrystalObstacle[]) {
                if (obstacle.health <= 0) continue;
                if (checkCollision(bullet, obstacle)) {
                    bullet.shouldBeRemoved = true;
                    this.addParticle(bullet.x, bullet.y, '#dddddd');
                    break;
                }
            }
        }
        
        // Enemies/Bosses vs Player
        for (const enemy of [...this.entityMap.enemy, ...this.entityMap.boss]) {
             if (this.player && checkCollision(this.player, enemy)) {
                this.player.takeDamage(1, this);
            }
        }

        // Powerups vs Player
        for (const powerup of this.entityMap.powerup) {
            if (this.player && checkCollision(this.player, powerup)) {
                powerup.shouldBeRemoved = true;
                this.player.activatePowerUp((powerup as PowerUp).powerUpType, this);
            }
        }
        
        // Hazards vs Player
        for(const hazard of this.entityMap.hazard as (LaserBeam | LavaPool | InkPool)[]) {
            if (!this.player) continue;

            if(hazard instanceof LavaPool || hazard instanceof InkPool) {
                if(checkCollision(this.player, hazard)) {
                    this.player.takeDamage(hazard.damagePerSecond * dt, this);
                }
            } else if(hazard instanceof LaserBeam && !hazard.isTelegraph) {
                if(getSqDistToSegment({x: this.player.x + this.player.width/2, y: this.player.y + this.player.height/2}, {x: hazard.x, y: hazard.y}, {x: hazard.x + hazard.width, y: hazard.y + hazard.height}) < (this.player.width/2)**2) {
                    this.player.takeDamage(hazard.damage, this);
                }
            }
        }
        
        // Obstacles vs Player (e.g. crystal pulse)
        for(const obstacle of this.entityMap.obstacle as CrystalObstacle[]) {
            if (this.player && obstacle.isPulsing && checkCollision(this.player, obstacle)) {
                 this.player.takeDamage(1, this);
            }
        }
    }
    
    draw() {
        this.starfield.draw();

        this.ctx.save();
        
        if (this.screenShake.timer > 0) {
            const { intensity } = this.screenShake;
            this.ctx.translate(rand(-intensity, intensity), rand(-intensity, intensity));
        }

        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const allEntities = Object.values(this.entityMap).flat().sort((a,b) => (a.y + a.height) - (b.y + b.height));
        for (const entity of allEntities) {
            entity.draw(this.ctx, this);
        }
        
        this.ctx.restore();
    }
    
    getStageConfig() {
        return STAGES[this.currentStage];
    }

    startNewGame(isTest = false, bossIndex = 0) {
        this.isTestMode = isTest;
        this.entityMap = this.getEmptyEntityMap();
        this.shardsEarnedThisRun = 0;
        
        this.player = new Player(CANVAS_WIDTH/2, CANVAS_HEIGHT - 100, this.upgrades);
        this.player.y = CANVAS_HEIGHT - 150;
        this.addEntity(this.player);

        if (isTest) {
            const bossClass = bossConstructors[bossIndex];
            this.startBossFight(bossClass);
        } else {
            this.currentStage = -1;
            this.currentWave = -1;
            this.startNextStage();
        }
    }
    
    startNextStage() {
        this.currentStage++;
        if (this.currentStage >= STAGES.length) {
            this.showVictoryScreen();
            return;
        }
        this.currentWave = 0;
        this.startNextWave();
    }
    
    startNextWave() {
        const stageConfig = this.getStageConfig();
        if (this.currentWave < stageConfig.waves.length) {
            const waveConfig = stageConfig.waves[this.currentWave];
            this.waveEnemiesToSpawn = waveConfig.e;
            this.waveSpawnTimer = 1.0; 
            this.setGameState('Playing');
            this.soundManager.playMusic('combat');
        } else {
            const bossClass = bossMap[stageConfig.bossId];
            this.startBossFight(bossClass);
        }
    }
    
    startBossFight(bossClass: (new (x: number, y: number, game: Game) => Boss) | undefined) {
        if (!bossClass) return;
        this.currentBoss = new bossClass(CANVAS_WIDTH / 2 - 75, 150, this);
        this.addEntity(this.currentBoss);
        this.setGameState('BossIntro');
        this.bossIntroTimer = 3.0;
        this.currentBoss.invincible = true;
        
        this.addEntity(new FloatingText(CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 50, this.currentBoss.name.toUpperCase(), '#ff2222', 48));
    }

    enterHub() {
        this.isTestMode = false;
        this.setGameState('Hub');
        this.entityMap = this.getEmptyEntityMap();
        this.currentBoss = null;
        this.gravityWell = null;

        this.upgrades.shards += this.shardsEarnedThisRun;
        this.shardsEarnedThisRun = 0;
        this.saveGame();
        
        if (this.player) this.player.resetTemporaryBuffs();
        this.player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, this.upgrades);
        this.addEntity(this.player);

        this.addEntity(new VoidPortal(CANVAS_WIDTH / 2 - 75, 100, (g) => g.startNewGame()));
        this.addEntity(new TestConsole(150, 400, (g) => g.setGameState('TestChamber')));
        this.addEntity(new ShardSynthesizer(CANVAS_WIDTH - 250, 400, (g) => g.setGameState('UpgradeScreen')));
        this.addEntity(new SanctumOfEchoes(CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT - 200, (g) => g.setGameState('LoreScreen')));
        
        this.soundManager.playMusic('hub');
    }

    // --- Screen State Changers ---
    showGameOverScreen() {
        this.setGameState('GameOver');
        this.soundManager.playGameOver();
    }

    showVictoryScreen() {
        this.setGameState('Victory');
        this.soundManager.stopMusic();
    }

    showIntermissionScreen() {
        this.upgrades.shards += this.shardsEarnedThisRun;
        this.shardsEarnedThisRun = 0;
        this.saveGame();
        
        // Populate upgrades for the UI
        const availableUpgrades = [...INTERMISSION_UPGRADES].filter(u => u.id !== 'piercing' || !this.player?.hasPiercing);
        const chosenUpgrades: IntermissionUpgradeInfo[] = [];
        while(chosenUpgrades.length < 3 && availableUpgrades.length > 0) {
            const index = Math.floor(Math.random() * availableUpgrades.length);
            chosenUpgrades.push(availableUpgrades.splice(index, 1)[0]);
        }
        this.setState({ intermissionUpgrades: chosenUpgrades });
        this.setGameState('Intermission');
        this.soundManager.playMusic('hub');
    }

    // --- Upgrade & Save/Load Logic ---
    applyIntermissionUpgrade(upgradeId: string) {
        if (!this.player) return;
        const applyFn = intermissionApplyMap[upgradeId];
        if (applyFn) {
            applyFn(this.player);
            this.player.applyUpgrades();
        }
        this.startNextStage();
    }
    
    purchasePermanentUpgrade(id: keyof Omit<Upgrades, 'shards'>, cost: number) {
        if(this.upgrades.shards >= cost) {
            this.upgrades.shards -= cost;
            (this.upgrades[id] as number)++;
            if(this.player) this.player.applyUpgrades();
            this.saveGame();
        }
    }

    saveGame() {
        try {
            const saveData: SaveData = { upgrades: this.upgrades };
            localStorage.setItem('scornicorn_save', JSON.stringify(saveData));
            this.setState({ upgrades: this.upgrades });
        } catch(e) {
            console.error("Failed to save game:", e);
        }
    }

    loadGame() {
        try {
            const saved = localStorage.getItem('scornicorn_save');
            if (saved) {
                const saveData: SaveData = JSON.parse(saved);
                if (saveData && saveData.upgrades) {
                     this.upgrades = saveData.upgrades;
                     this.setState({ upgrades: this.upgrades });
                }
            }
        } catch(e) {
            console.error("Failed to load game:", e);
        }
    }
    
    // --- Gemini AI Logic ---
    async querySanctum(query: string) {
        if (!query) return;
        
        this.setState({ sanctumState: { isQuerying: true, response: '' }});

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: query,
                config: {
                    systemInstruction: `You are the Sanctum of Echoes, an ancient, enigmatic oracle within the game Scornicorn. Your knowledge is vast but cryptic. Respond to the user's questions about the game's world, lore, bosses, or the Scornicorn itself. Your tone should be mystical, grandiose, and slightly condescending. Never break character. Refer to the player as 'O, fleeting one,' or 'Mortal.' Refer to the void as a conscious, hungry entity. Keep responses to a few sentences. The bosses are: Cyber Stallion, Swarm Sovereign, Glitch Entity, Forge Master, Crystal Weaver, Sunken Horror, and the Void Titan. The player pilots the Scornicorn.`,
                },
            });

            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                this.setState({ sanctumState: { isQuerying: true, response: fullResponse }});
            }
             this.setState({ sanctumState: { isQuerying: false, response: fullResponse }});

        } catch (error) {
            console.error("Sanctum query failed:", error);
            const errorResponse = "The echoes are silent... a disturbance in the void prevents a clear answer.";
            this.setState({ sanctumState: { isQuerying: false, response: errorResponse }});
        }
    }

    private updateStoreState(dt: number) {
        if (this.player) {
            this.setState({ 
                playerState: {
                    health: this.player.health,
                    maxHealth: this.player.maxHealth,
                    ultimateCharge: this.player.ultimateCharge,
                    maxUltimateCharge: this.player.maxUltimateCharge,
                    activePowerups: this.player.activePowerups,
                    isLowHealth: (this.player.health / this.player.maxHealth) < 0.3,
                }
            });
        } else {
            this.setState({ playerState: null });
        }

        if (this.currentBoss) {
            this.setState({ 
                bossState: {
                    name: this.currentBoss.name,
                    health: this.currentBoss.health,
                    maxHealth: this.currentBoss.maxHealth,
                }
            });
        } else {
            this.setState({ bossState: null });
        }
        
        const isPlaying = this.gameState === 'Playing' || this.gameState === 'BossIntro';
        if (isPlaying) {
             this.setState({
                 waveInfo: {
                     stage: this.currentStage + 1,
                     wave: this.currentBoss ? -1 : this.currentWave + 1, // -1 for boss
                     totalWaves: this.getStageConfig().waves.length,
                     show: true,
                 }
             });
        } else {
            this.setState({ waveInfo: { show: false, stage: 0, wave: 0, totalWaves: 0 } });
        }
    }
}
