
class TacticalSoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createGain(val: number = 0.1) {
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(val, this.ctx!.currentTime);
    gain.connect(this.ctx!.destination);
    return gain;
  }

  // General UI Click - Normal, tactile pop
  playClick() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.createGain(0.1); // Increased from 0.06
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx!.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.04);
    osc.connect(gain);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.04);
  }

  // Camera Shutter - Crisp, mechanical snap
  playShutter() {
    this.init();
    const bufferSize = this.ctx!.sampleRate * 0.08;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx!.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.ctx!.currentTime);
    const gain = this.createGain(0.2); // Increased from 0.12
    noise.connect(filter);
    filter.connect(gain);
    noise.start();
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.08);
  }

  // Entering the Game - Short, powerful chime
  playEnterGrid() {
    this.init();
    [200, 400, 600].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.createGain(0.08); // Increased from 0.05
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.3);
      osc.connect(gain);
      osc.start();
      osc.stop(this.ctx!.currentTime + 0.3);
    });
  }

  // Success Chord - Rapid, rewarding arpeggio
  playSuccess() {
    this.init();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.createGain(0.07); // Increased from 0.04
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.25);
      osc.connect(gain);
      osc.start();
      osc.stop(this.ctx!.currentTime + 0.25);
    });
  }

  // Navigation Thud - Sub-frequency industrial thud
  playNav() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.createGain(0.18); // Increased from 0.12
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx!.currentTime + 0.15);
    gain.gain.setValueAtTime(0.18, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.15);
    osc.connect(gain);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.15);
  }
}

export const soundService = new TacticalSoundEngine();
