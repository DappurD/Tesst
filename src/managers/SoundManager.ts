

export class SoundManager {
    private audioCtx: AudioContext | null = null;
    private musicSource: OscillatorNode | null = null;
    private musicGain: GainNode | null = null;
    private musicLfo: OscillatorNode | null = null;
    private musicLfoGain: GainNode | null = null;
    private isInitialized = false;
    private musicScheduler: number | null = null;
    private currentMusicType: 'hub' | 'combat' | null = null;

    constructor() {
        const resumeContext = () => {
            if (this.isInitialized) return;
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.playMusic('hub');
            this.isInitialized = true;
            document.removeEventListener('click', resumeContext);
            document.removeEventListener('keydown', resumeContext);
        };
        document.addEventListener('click', resumeContext);
        document.addEventListener('keydown', resumeContext);
    }
    
    private play(type: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise', freq: number, duration: number, volume = 0.5, options: any = {}) {
        if (!this.audioCtx) return;
        
        const time = this.audioCtx.currentTime;
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(volume, time);
        gainNode.gain.linearRampToValueAtTime(0, time + duration);
        gainNode.connect(this.audioCtx.destination);
        
        if (type === 'noise') {
            const noise = this.audioCtx.createBufferSource();
            const buffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * duration, this.audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            noise.connect(gainNode);
            noise.start(time);
        } else {
            const osc = this.audioCtx.createOscillator();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, time);
            if (options.pitchBend) {
                osc.frequency.linearRampToValueAtTime(options.pitchBend, time + duration);
            }
            osc.connect(gainNode);
            osc.start(time);
            osc.stop(time + duration);
        }
    }

    playShoot() { this.play('triangle', 880, 0.1, 0.1, { pitchBend: 440 }); }
    playHit() { this.play('noise', 0, 0.1, 0.2); }
    playExplosion() { this.play('noise', 0, 0.4, 0.4); }
    playDash() { this.play('sawtooth', 200, 0.15, 0.2, { pitchBend: 1200 }); }
    playPowerUp() { this.play('sine', 1046, 0.1, 0.3); setTimeout(() => this.play('sine', 1318, 0.1, 0.3), 100); }
    playUIClick() { this.play('sine', 1000, 0.05, 0.2); }
    playBossTransition() { this.play('sawtooth', 55, 1.5, 0.5, { pitchBend: 110 }); }
    playGameOver() { this.play('sawtooth', 110, 2.0, 0.4, { pitchBend: 20 }); }

    playMusic(type: 'hub' | 'combat') {
        if (!this.audioCtx || this.currentMusicType === type) return;
        this.stopMusic();
        this.currentMusicType = type;

        const baseVolume = 0.1;
        this.musicGain = this.audioCtx.createGain();
        this.musicGain.gain.setValueAtTime(baseVolume, this.audioCtx.currentTime);
        this.musicGain.connect(this.audioCtx.destination);

        if (type === 'hub') {
            this.playAmbientDrone();
        } else if (type === 'combat') {
            this.playArpeggiator();
        }
    }
    
    private playAmbientDrone() {
        if (!this.audioCtx || !this.musicGain) return;
        this.musicSource = this.audioCtx.createOscillator();
        this.musicSource.type = 'sine'; // Use a clean sine wave for a smoother drone
        this.musicSource.frequency.value = 55; // A1

        this.musicLfo = this.audioCtx.createOscillator();
        this.musicLfo.type = 'sine';
        this.musicLfo.frequency.value = 0.1;

        this.musicLfoGain = this.audioCtx.createGain();
        this.musicLfoGain.gain.value = 10;
        
        this.musicLfo.connect(this.musicLfoGain);
        this.musicLfoGain.connect(this.musicSource.detune);
        
        this.musicSource.connect(this.musicGain);
        this.musicSource.start();
        this.musicLfo.start();
    }
    
    private playArpeggiator() {
        if (!this.audioCtx) return;
        const sequence = [0, 3, 7, 10, 12, 10, 7, 3]; // Minor pentatonic scale tones
        const baseNote = 55; // A1
        let seqIdx = 0;
        const noteDuration = 0.125; // 8th notes

        const playNote = () => {
            if (this.currentMusicType !== 'combat' || !this.audioCtx) return;
            const note = baseNote * Math.pow(2, sequence[seqIdx % sequence.length] / 12);
            this.play('triangle', note, noteDuration, 0.1);
            this.play('sawtooth', note/2, noteDuration, 0.05);
            seqIdx++;
            this.musicScheduler = window.setTimeout(playNote, noteDuration * 1000);
        };
        playNote();
    }

    stopMusic() {
        if (this.musicScheduler) {
            clearTimeout(this.musicScheduler);
            this.musicScheduler = null;
        }
        if (this.musicLfo) {
            try { this.musicLfo.stop(); } catch(e) {}
            this.musicLfo.disconnect();
            this.musicLfo = null;
        }
        if (this.musicLfoGain) {
            this.musicLfoGain.disconnect();
            this.musicLfoGain = null;
        }
        if (this.musicSource) {
            try { this.musicSource.stop(); } catch(e) {}
            this.musicSource.disconnect();
            this.musicSource = null;
        }
        if (this.musicGain) {
            this.musicGain.disconnect();
            this.musicGain = null;
        }
        this.currentMusicType = null;
    }
}