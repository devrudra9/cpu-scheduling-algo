import { Injectable } from '@angular/core';
import { Process, SchedulingResult } from '../models/process.model';

@Injectable()
export class SchedulingService {

  // Public API: run selected algorithm on provided processes
  run(algorithm: string, processes: Process[], timeQuantum?: number): SchedulingResult {
    // Work on a deep copy of processes
    const procCopy = processes.map(p => ({ ...p }));
    switch (algorithm) {
      case 'optFCFS':
        return this.fcfs(procCopy);
      case 'optSJF':
        return this.sjf(procCopy);
      case 'optSRTF':
        return this.srtf(procCopy);
      case 'optRR':
        return this.rr(procCopy, timeQuantum || 1);
      default:
        return this.fcfs(procCopy);
    }
  }

  private fcfs(processList: Process[]): SchedulingResult {
    let time = 0;
    const queue: Process[] = [];
    const completedList: Process[] = [];

    // Sort initial list by arrivalTime then processID for deterministic behavior
    processList.sort((a, b) => a.arrivalTime - b.arrivalTime || a.processID - b.processID);

    while (processList.length > 0 || queue.length > 0) {
      while (queue.length === 0 && processList.length > 0 && time < processList[0].arrivalTime) {
        time++;
      }
      // add arrived processes
      while (processList.length > 0 && processList[0].arrivalTime <= time) {
        queue.push(processList.shift() as Process);
      }
      if (queue.length === 0) continue;
      const process = queue.shift() as Process;
      time += process.burstTime;
      process.completedTime = time;
      process.turnAroundTime = (process.completedTime - process.arrivalTime);
      process.waitingTime = process.turnAroundTime - process.burstTime;
      completedList.push(process);
    }

    return this.calculateMetrics(completedList);
  }

  private sjf(processList: Process[]): SchedulingResult {
    let time = 0;
    const queue: Process[] = [];
    const completedList: Process[] = [];

    // We'll repeatedly add processes that arrive at current time
    processList.sort((a, b) => a.arrivalTime - b.arrivalTime || a.processID - b.processID);

    while (processList.length > 0 || queue.length > 0) {
      // add arrived
      while (processList.length > 0 && processList[0].arrivalTime <= time) {
        queue.push(processList.shift() as Process);
      }
      if (queue.length === 0) {
        // advance time to next arrival if any
        if (processList.length > 0) {
          time = processList[0].arrivalTime;
          continue;
        } else break;
      }
      // select shortest burst
      queue.sort((a, b) => a.burstTime - b.burstTime || a.processID - b.processID);
      const proc = queue.shift() as Process;
      time += proc.burstTime;
      proc.completedTime = time;
      proc.turnAroundTime = proc.completedTime - proc.arrivalTime;
      proc.waitingTime = proc.turnAroundTime - proc.burstTime;
      completedList.push(proc);
    }

    return this.calculateMetrics(completedList);
  }

  private srtf(processList: Process[]): SchedulingResult {
    // Shortest Remaining Time First (preemptive)
    const originalTable = processList.map(p => ({ ...p }));
    let time = 0;
    const queue: Process[] = [];
    const completedList: Process[] = [];

    // sort by arrival
    processList.sort((a, b) => a.arrivalTime - b.arrivalTime || a.processID - b.processID);

    while (processList.length > 0 || queue.length > 0) {
      while (processList.length > 0 && processList[0].arrivalTime <= time) {
        queue.push(processList.shift() as Process);
      }
      if (queue.length === 0) {
        if (processList.length > 0) {
          time = processList[0].arrivalTime;
          continue;
        } else break;
      }
      queue.sort((a, b) => a.burstTime - b.burstTime || a.processID - b.processID);
      const current = queue[0];
      // run one unit
      current.burstTime = current.burstTime - 1;
      time += 1;
      // add newly arrived
      while (processList.length > 0 && processList[0].arrivalTime <= time) {
        queue.push(processList.shift() as Process);
      }
      // if finished
      if (current.burstTime === 0) {
        const finished = queue.shift() as Process;
        finished.completedTime = time;
        completedList.push(finished);
      }
    }

    // Restore original burst times for reporting
    completedList.forEach(c => {
      const orig = originalTable.find(o => o.processID === c.processID);
      if (orig) {
        c.burstTime = orig.burstTime;
        c.turnAroundTime = (c.completedTime as number) - c.arrivalTime;
        c.waitingTime = c.turnAroundTime - c.burstTime;
      }
    });

    return this.calculateMetrics(completedList);
  }

  private rr(processList: Process[], timeQuantum: number): SchedulingResult {
    const originalTable = processList.map(p => ({ ...p }));
    let time = 0;
    const queue: Process[] = [];
    const completedList: Process[] = [];

    processList.sort((a, b) => a.arrivalTime - b.arrivalTime || a.processID - b.processID);

    while (processList.length > 0 || queue.length > 0) {
      while (processList.length > 0 && processList[0].arrivalTime <= time) {
        queue.push(processList.shift() as Process);
      }
      if (queue.length === 0) {
        if (processList.length > 0) {
          time = processList[0].arrivalTime;
          continue;
        } else break;
      }

      const proc = queue.shift() as Process;
      if (proc.burstTime <= timeQuantum) {
        time += proc.burstTime;
        proc.completedTime = time;
        completedList.push(proc);
      } else {
        proc.burstTime = proc.burstTime - timeQuantum;
        time += timeQuantum;
        // push back
        // before pushing back, add any newly arrived
        while (processList.length > 0 && processList[0].arrivalTime <= time) {
          queue.push(processList.shift() as Process);
        }
        queue.push(proc);
      }
    }

    // Restore original burst times and compute metrics
    completedList.forEach(c => {
      const orig = originalTable.find(o => o.processID === c.processID);
      if (orig) {
        c.burstTime = orig.burstTime;
        c.turnAroundTime = (c.completedTime as number) - c.arrivalTime;
        c.waitingTime = c.turnAroundTime - c.burstTime;
      }
    });

    return this.calculateMetrics(completedList);
  }

  private calculateMetrics(completedList: Process[]): SchedulingResult {
    let totalTurnaround = 0;
    let totalWaiting = 0;
    let maxCompleted = 0;
    completedList.forEach(p => {
      if (p.completedTime && p.completedTime > maxCompleted) maxCompleted = p.completedTime;
      totalTurnaround += (p.turnAroundTime || 0);
      totalWaiting += (p.waitingTime || 0);
    });

    const avgTurnaround = completedList.length ? totalTurnaround / completedList.length : 0;
    const avgWaiting = completedList.length ? totalWaiting / completedList.length : 0;
    const throughput = maxCompleted ? completedList.length / maxCompleted : 0;

    return {
      completedList,
      averageTurnaroundTime: avgTurnaround,
      averageWaitingTime: avgWaiting,
      throughput
    };
  }
}
