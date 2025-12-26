export interface Process {
  processID: number;
  arrivalTime: number;
  burstTime: number;
  completedTime?: number;
  turnAroundTime?: number;
  waitingTime?: number;
}

export interface SchedulingResult {
  completedList: Process[];
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  throughput: number;
}
