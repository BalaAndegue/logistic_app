import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrl: './supervisor-dashboard.component.scss'
})
export class SupervisorDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm'],
    datasets: [
      {
        data: [5, 12, 18, 10, 15, 20],
        label: 'Deliveries Validated',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } }
  };
  
  public lineChartType: 'line' = 'line';

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.analyticsService.getDashboardKpis().subscribe({
      next: (response) => {
        // Mapping the 4 backend attributes to your template fields
        this.stats = {
          readyToShip: response.data.orders_ready_to_ship,
          inProgress: response.data.deliveries_in_progress,
          delivered: response.data.deliveries_successful,
          pendingValidation: response.data.deliveries_failed
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching supervisor KPIs:', err);
        this.loading = false;
      }
    });
  }
}