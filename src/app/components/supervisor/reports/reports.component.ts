import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-supervisor-reports',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  loading = false;
  
  // Example Report Data
  reportSummary = [
    { label: 'Total Deliveries', value: 450, trend: '+12%' },
    { label: 'Avg. Validation Time', value: '14 min', trend: '-2%' },
    { label: 'Success Rate', value: '98.5%', trend: '+0.5%' },
    { label: 'Flagged Issues', value: 3, trend: '-10%' }
  ];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Completed', backgroundColor: '#2563eb' },
      { data: [2, 4, 1, 0, 3, 2, 1], label: 'Flagged', backgroundColor: '#ef4444' }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor() {}

  ngOnInit(): void {}

  exportReport() {
    window.print(); // Simple way to trigger a PDF export via browser
  }
}