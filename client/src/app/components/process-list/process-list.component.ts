import { Component, EventEmitter, Output } from '@angular/core';
import { Process } from '../../models/process.model';

@Component({
  selector: 'app-process-list',
  templateUrl: './process-list.component.html',
  styleUrls: ['./process-list.component.css']
})
export class ProcessListComponent {
  processes: Process[] = [];
  processID?: number;
  arrivalTime?: number;
  burstTime?: number;

  addProcess() {
    if (this.processID == null || this.arrivalTime == null || this.burstTime == null) return;
    this.processes.push({ processID: this.processID, arrivalTime: this.arrivalTime, burstTime: this.burstTime });
    // reset inputs
    this.processID = undefined; this.arrivalTime = undefined; this.burstTime = undefined;
  }
}
