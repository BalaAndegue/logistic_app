import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { SupervisorMockService, SupervisorStats } from '../../services/supervisor-mock.service';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrl: './supervisor-dashboard.component.scss'
})
export class SupervisorDashboardComponent implements OnInit {
  stats: SupervisorStats | null = null;
  loading = true;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } }
  };
  
  public lineChartType: 'line' = 'line';

  constructor(private supervisorService: SupervisorMockService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    // Load Stats
    this.supervisorService.getDashboardStats().subscribe(data => {
      this.stats = data;
      this.loading = false;
    });

    // Load Chart
    this.supervisorService.getPerformanceTrends().subscribe(data => {
      this.lineChartData = data;
    });
  }
}