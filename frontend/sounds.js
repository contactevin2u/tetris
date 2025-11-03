// Sound Manager using Web Audio API
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.enabled = true;
        this.bgMusic = null;
        this.bgMusicGain = null;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    // Resume audio context (required after user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Play a simple beep sound
    playBeep(frequency, duration, volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Move/Rotate sound
    playMove() {
        this.playBeep(220, 0.05, 0.15);
    }

    // Hard drop sound
    playDrop() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    // Line clear sound
    playLineClear(lines = 1) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const baseFreq = 400 + (lines * 100);

        for (let i = 0; i < 3; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = baseFreq + (i * 200);
            oscillator.type = 'sine';

            const startTime = this.audioContext.currentTime + (i * 0.05);
            gainNode.gain.setValueAtTime(0.4 * this.masterVolume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.2);
        }
    }

    // Combo sound (3+ lines)
    playCombo(comboCount = 1) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (higher)

        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'triangle';

            const startTime = this.audioContext.currentTime + (i * 0.08);
            const volume = 0.3 + (comboCount * 0.05);
            gainNode.gain.setValueAtTime(Math.min(volume, 0.5) * this.masterVolume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }

    // Perfect clear sound
    playPerfectClear() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C-E-G-C-E-G (octave higher)

        melody.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = this.audioContext.currentTime + (i * 0.1);
            gainNode.gain.setValueAtTime(0.4 * this.masterVolume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.4);
        });
    }

    // Game over sound
    playGameOver() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const notes = [392, 349.23, 293.66, 261.63]; // G-F-D-C (descending)

        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'triangle';

            const startTime = this.audioContext.currentTime + (i * 0.15);
            gainNode.gain.setValueAtTime(0.4 * this.masterVolume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.5);
        });
    }

    // Game start sound
    playGameStart() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const notes = [261.63, 329.63, 392, 523.25]; // C-E-G-C (ascending)

        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = this.audioContext.currentTime + (i * 0.1);
            gainNode.gain.setValueAtTime(0.4 * this.masterVolume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }

    // Countdown tick sound
    playCountdownTick() {
        this.playBeep(800, 0.1, 0.3);
    }

    // Warning sound (time running out)
    playWarning() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        for (let i = 0; i < 2; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 880;
            oscillator.type = 'sawtooth';

            const startTime = this.audioContext.currentTime + (i * 0.15);
            gainNode.gain.setValueAtTime(0.25 * this.masterVolume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.1);
        }
    }

    // Background music - Simple tension-building loop
    startBackgroundMusic() {
        if (!this.enabled || !this.audioContext || this.bgMusic) return;
        this.resume();

        // Create a simple bass line loop
        const loop = () => {
            if (!this.bgMusic) return;

            const bassNotes = [130.81, 146.83, 164.81, 146.83]; // C-D-E-D
            const currentNote = bassNotes[Math.floor(Date.now() / 1000) % bassNotes.length];

            const oscillator = this.audioContext.createOscillator();
            this.bgMusicGain = this.audioContext.createGain();

            oscillator.connect(this.bgMusicGain);
            this.bgMusicGain.connect(this.audioContext.destination);

            oscillator.frequency.value = currentNote;
            oscillator.type = 'triangle';

            this.bgMusicGain.gain.setValueAtTime(0.05 * this.masterVolume, this.audioContext.currentTime);
            this.bgMusicGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.8);

            this.bgMusic = setTimeout(loop, 1000);
        };

        this.bgMusic = setTimeout(loop, 0);
    }

    stopBackgroundMusic() {
        if (this.bgMusic) {
            clearTimeout(this.bgMusic);
            this.bgMusic = null;
        }
    }

    // Toggle sound
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopBackgroundMusic();
        }
        return this.enabled;
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();
