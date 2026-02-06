export class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.createSoundEffects();
    }

    createSoundEffects() {
        this.createShootSound();
        this.createExplosionSound();
        this.createPowerUpSound();
        this.createHurtSound();
        this.createLevelUpSound();
    }

    createShootSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            channelData[i] = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-10 * t);
        }
        
        this.sounds.shoot = buffer;
    }

    createExplosionSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.exp(-4 * i / buffer.length);
        }
        
        this.sounds.explosion = buffer;
    }

    createPowerUpSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.4, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        const frequencies = [440, 550, 660];
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freqIndex = Math.floor(t / 0.133);
            if (freqIndex < frequencies.length) {
                channelData[i] = Math.sin(2 * Math.PI * frequencies[freqIndex] * t) * (1 - t / 0.4);
            }
        }
        
        this.sounds.powerup = buffer;
    }

    createHurtSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 440 * Math.pow(0.5, t / 0.2);
            channelData[i] = Math.sin(2 * Math.PI * freq * t) * (1 - t / 0.2);
        }
        
        this.sounds.hurt = buffer;
    }

    createLevelUpSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.6, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        const frequencies = [440, 550, 660, 880];
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freqIndex = Math.floor(t / 0.15);
            if (freqIndex < frequencies.length) {
                channelData[i] = Math.sin(2 * Math.PI * frequencies[freqIndex] * t) * (1 - t / 0.6);
            }
        }
        
        this.sounds.levelUp = buffer;
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[soundName];
            source.connect(this.audioContext.destination);
            source.start();
        }
    }
}
