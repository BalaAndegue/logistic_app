import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { AnalyticsService } from '../../../services/analytics.service';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  loading = true;
  
  // Existing structure kept exactly as is
  reportSummary = [
    { label: 'Total Deliveries', value: '0', trend: '+12.5%' }, // Index 0: delivered_orders
    { label: 'Avg. Validation Time', value: '14 min', trend: '-2.4%' },
    { label: 'Success Rate', value: '0%', trend: '+0.5%' },    // Index 2: delivery_rate
    { label: 'Flagged Issues', value: '3', trend: '-10.2%' }
  ];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Completed', backgroundColor: '#3b82f6' },
      { data: [2, 4, 3, 5, 2, 3, 1], label: 'Flagged', backgroundColor: '#ef4444' }
    ]
  };

  public barChartOptions: any = { responsive: true, maintainAspectRatio: false };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadRealData();
  }

  loadRealData(): void {
    this.loading = true;
    this.analyticsService.getDashboardKpis().subscribe({
      next: (response) => {
        const data = response.data;
        
        // Updating only the requested attributes in the existing array
        // Total Deliveries
        this.reportSummary[0].value = data.delivered_orders.toString(); 
        
        // Success Rate (converted to percentage)
        this.reportSummary[2].value = (data.delivery_rate * 100).toFixed(1) + '%';
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching reports data', err);
        this.loading = false;
      }
    });
  }

  exportReport() {
    console.log('Exporting report...');
  }
}