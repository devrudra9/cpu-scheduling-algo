import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gantt',
  templateUrl: './gantt.component.html'
})
export class GanttComponent implements OnInit {
  timeline: any = null;

  ngOnInit(): void {
    this.timeline = (window as any).__schedulingResult?.timeline || null;
  }
}

