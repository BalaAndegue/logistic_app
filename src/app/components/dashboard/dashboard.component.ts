import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, DashboardStats, ChartData } from '../../services/stats.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  // Chart Properties - Correction ici
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
  
  // CHANGEZ CETTE LIGNE
  public lineChartType: 'line' = 'line'; // Utilisez le type littéral

  constructor(private statsService: StatsService) { }

  ngOnInit() {
    this.loadStats();
    this.loadCharts();
  }

  loadStats() {
    this.statsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading = false;
      }
    });
  }

  loadCharts() {
    this.statsService.getDeliveryTrends().subscribe({
      next: (data) => {
        this.lineChartData = {
          labels: data.labels,
          datasets: data.datasets.map(ds => ({
            ...ds,
            tension: 0.4,
            // Assurez-vous que chaque dataset a les bonnes propriétés pour un line chart
            fill: false,
            borderColor: this.getBorderColor(ds.label),
            backgroundColor: this.getBackgroundColor(ds.label)
          }))
        };
      },
      error: (error) => {
        console.error('Error loading charts:', error);
        // Données par défaut en cas d'erreur
        this.setDefaultChartData();
      }
    });
  }

  // Méthodes pour générer des couleurs cohérentes
  private getBorderColor(label: string): string {
    const colors: { [key: string]: string } = {
      'Deliveries': 'rgb(75, 192, 192)',
      'Success Rate': 'rgb(255, 99, 132)',
      'Default': 'rgb(54, 162, 235)'
    };
    return colors[label] || colors['Default'];
  }

  private getBackgroundColor(label: string): string {
    const colors: { [key: string]: string } = {
      'Deliveries': 'rgba(75, 192, 192, 0.2)',
      'Success Rate': 'rgba(255, 99, 132, 0.2)',
      'Default': 'rgba(54, 162, 235, 0.2)'
    };
    return colors[label] || colors['Default'];
  }

  private setDefaultChartData() {
    this.lineChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Deliveries',
          data: [65, 59, 80, 81, 56, 55],
          tension: 0.4,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)'
        },
        {
          label: 'Success Rate %',
          data: [85, 88, 92, 89, 87, 90],
          tension: 0.4,
          fill: false,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)'
        }
      ]
    };
  }
}