import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html'
})
export class ResultsComponent implements OnInit {
  result: any = null;

  ngOnInit(): void {
    // In this scaffold the scheduling result is written to window.__schedulingResult
    this.result = (window as any).__schedulingResult || null;
  }
}

