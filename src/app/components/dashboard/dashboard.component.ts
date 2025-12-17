import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, DashboardStats, ChartData } from '../../services/stats.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  // Chart Properties
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }
    }
  };
  public lineChartType: ChartType = 'line';

  constructor(private statsService: StatsService) { }

  ngOnInit() {
    this.loadStats();
    this.loadCharts();
  }

  loadStats() {
    this.statsService.getDashboardStats().subscribe(data => {
      this.stats = data;
      this.loading = false;
    });
  }

  loadCharts() {
    this.statsService.getDeliveryTrends().subscribe(data => {
      this.lineChartData = {
        labels: data.labels,
        datasets: data.datasets.map(ds => ({
          ...ds,
          tension: 0.4 // Smooth curves
        }))
      };
    });
  }
}
