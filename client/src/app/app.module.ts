import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ProcessListComponent } from './components/process-list/process-list.component';
import { ControlsComponent } from './components/controls/controls.component';
import { ResultsComponent } from './components/results/results.component';
import { GanttComponent } from './components/gantt/gantt.component';

import { SchedulingService } from './services/scheduling.service';

@NgModule({
  declarations: [
    AppComponent,
    ProcessListComponent,
    ControlsComponent,
    ResultsComponent,
    GanttComponent
  ],
  imports: [BrowserModule, FormsModule],
  providers: [SchedulingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
