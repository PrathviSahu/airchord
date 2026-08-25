interface LatencyEntry {
  timestamp: number;
  gesture: string;
  chord: string;
  totalMs: number;
}

class LatencyProfiler {
  private entries: LatencyEntry[] = [];
  private startTime = 0;

  startMeasurement() {
    this.startTime = performance.now();
  }

  record(gesture: string, chord: string) {
    const totalMs = performance.now() - this.startTime;
    this.entries.push({
      timestamp: Date.now(),
      gesture,
      chord,
      totalMs,
    });
    return totalMs;
  }

  getAverage(): number {
    if (this.entries.length === 0) return 0;
    const sum = this.entries.reduce((a, e) => a + e.totalMs, 0);
    return sum / this.entries.length;
  }

  getP90(): number {
    if (this.entries.length === 0) return 0;
    const sorted = [...this.entries].sort((a, b) => a.totalMs - b.totalMs);
    const idx = Math.floor(sorted.length * 0.9);
    return sorted[idx]?.totalMs ?? 0;
  }

  exportCsv(): string {
    const header = 'timestamp,gesture,chord,totalMs\n';
    const rows = this.entries.map(e =>
      `${e.timestamp},${e.gesture},${e.chord},${e.totalMs.toFixed(2)}`
    ).join('\n');
    return header + rows;
  }

  downloadCsv() {
    const csv = this.exportCsv();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airchord-latency-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clear() {
    this.entries = [];
  }

  get count() {
    return this.entries.length;
  }
}

export const latencyProfiler = new LatencyProfiler();
