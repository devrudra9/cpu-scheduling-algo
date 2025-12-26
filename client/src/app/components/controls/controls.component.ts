import { Component } from '@angular/core';
import { SchedulingService } from '../../services/scheduling.service';
import { Process } from '../../models/process.model';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html'
})
export class ControlsComponent {
  algorithm = 'optFCFS';
  timeQuantum?: number;

  // Local processes are fetched from DOM component in this simple scaffold. In a fuller implementation
  // we'd lift the process list into a shared service or use Output events. For now the scheduling
  // service will accept manual input via `getProcessesFromTable()` helper (not ideal but keeps scaffold simple).
  constructor(private scheduling: SchedulingService) {}

  run() {
    const processes = this.getProcessesFromTable();
    if (processes.length === 0) {
      alert('Please insert some processes');
      return;
    }
    if (this.algorithm === 'optRR' && (this.timeQuantum == null || this.timeQuantum <= 0)) {
      alert('Please enter time quantum');
      return;
    }

    const result = this.scheduling.run(this.algorithm, processes, this.timeQuantum);
    // Store result on window for ResultsComponent to read (quick scaffold solution)
    (window as any).__schedulingResult = result;
    // notify user
    alert('Scheduling complete — open Results section to view');
  }

  // Quick helper to read table in this scaffold; in full app this would be shared state
  private getProcessesFromTable(): Process[] {
    const rows = document.querySelectorAll('#tblProcessList tbody tr');
    const procs: Process[] = [];
    rows.forEach(r => {
      const cells = r.querySelectorAll('td');
      if (cells.length >= 3) {
        const pid = parseInt(cells[0].textContent || '0', 10);
        const at = parseInt(cells[1].textContent || '0', 10);
        const bt = parseInt(cells[2].textContent || '0', 10);
        procs.push({ processID: pid, arrivalTime: at, burstTime: bt });
      }
    });
    return procs;
  }
}
