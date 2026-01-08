import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  loading = false;
  saving = false;
  successMessage = '';
  errorMessage = '';

  // Ajout de la propriété today
  today = new Date();

  // Paramètres système
  systemSettings = {
    autoAssignment: {
      enabled: true,
      algorithm: 'distance_based',
      maxDistance: 25,
      maxDeliveriesPerDriver: 8,
      considerTraffic: true,
      considerDriverRating: true
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      assignmentAlerts: true,
      deliveryUpdates: true,
      reportGeneration: true
    },
    performance: {
      deliveryTimeThreshold: 60,
      successRateThreshold: 85,
      ratingThreshold: 4.0
    },
    system: {
      maintenanceMode: false,
      dataRetention: 90,
      backupFrequency: 'daily'
    }
  };

  autoAssignmentAlgorithms = [
    { value: 'distance_based', label: 'Basé sur la distance', description: 'Assigne au livreur le plus proche' },
    { value: 'load_balanced', label: 'Équilibrage de charge', description: 'Répartit équitablement entre les livreurs' },
    { value: 'priority_based', label: 'Basé sur la priorité', description: 'Tient compte de la priorité des commandes' },
    { value: 'rating_based', label: 'Basé sur les notes', description: 'Assigne aux livreurs les mieux notés' }
  ];

  backupFrequencies = [
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  initForm(): void {
    this.settingsForm = this.fb.group({
      autoAssignmentEnabled: [true],
      assignmentAlgorithm: ['distance_based'],
      maxDistance: [25, [Validators.min(1), Validators.max(100)]],
      maxDeliveriesPerDriver: [8, [Validators.min(1), Validators.max(20)]],
      considerTraffic: [true],
      considerDriverRating: [true],
      emailEnabled: [true],
      pushEnabled: [true],
      assignmentAlerts: [true],
      deliveryUpdates: [true],
      reportGeneration: [true],
      deliveryTimeThreshold: [60, [Validators.min(15), Validators.max(180)]],
      successRateThreshold: [85, [Validators.min(50), Validators.max(100)]],
      ratingThreshold: [4.0, [Validators.min(1), Validators.max(5)]],
      maintenanceMode: [false],
      dataRetention: [90, [Validators.min(30), Validators.max(365)]],
      backupFrequency: ['daily']
    });
  }

  loadSettings(): void {
    this.loading = true;
    setTimeout(() => {
      const savedSettings = localStorage.getItem('system_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.systemSettings = { ...this.systemSettings, ...settings };
        this.updateFormFromSettings();
      }
      this.loading = false;
    }, 800);
  }

  updateFormFromSettings(): void {
    this.settingsForm.patchValue({
      autoAssignmentEnabled: this.systemSettings.autoAssignment.enabled,
      assignmentAlgorithm: this.systemSettings.autoAssignment.algorithm,
      maxDistance: this.systemSettings.autoAssignment.maxDistance,
      maxDeliveriesPerDriver: this.systemSettings.autoAssignment.maxDeliveriesPerDriver,
      considerTraffic: this.systemSettings.autoAssignment.considerTraffic,
      considerDriverRating: this.systemSettings.autoAssignment.considerDriverRating,
      emailEnabled: this.systemSettings.notifications.emailEnabled,
      pushEnabled: this.systemSettings.notifications.pushEnabled,
      assignmentAlerts: this.systemSettings.notifications.assignmentAlerts,
      deliveryUpdates: this.systemSettings.notifications.deliveryUpdates,
      reportGeneration: this.systemSettings.notifications.reportGeneration,
      deliveryTimeThreshold: this.systemSettings.performance.deliveryTimeThreshold,
      successRateThreshold: this.systemSettings.performance.successRateThreshold,
      ratingThreshold: this.systemSettings.performance.ratingThreshold,
      maintenanceMode: this.systemSettings.system.maintenanceMode,
      dataRetention: this.systemSettings.system.dataRetention,
      backupFrequency: this.systemSettings.system.backupFrequency
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.markFormGroupTouched(this.settingsForm);
      this.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValues = this.settingsForm.value;
    
    this.systemSettings = {
      autoAssignment: {
        enabled: formValues.autoAssignmentEnabled,
        algorithm: formValues.assignmentAlgorithm,
        maxDistance: formValues.maxDistance,
        maxDeliveriesPerDriver: formValues.maxDeliveriesPerDriver,
        considerTraffic: formValues.considerTraffic,
        considerDriverRating: formValues.considerDriverRating
      },
      notifications: {
        emailEnabled: formValues.emailEnabled,
        pushEnabled: formValues.pushEnabled,
        assignmentAlerts: formValues.assignmentAlerts,
        deliveryUpdates: formValues.deliveryUpdates,
        reportGeneration: formValues.reportGeneration
      },
      performance: {
        deliveryTimeThreshold: formValues.deliveryTimeThreshold,
        successRateThreshold: formValues.successRateThreshold,
        ratingThreshold: formValues.ratingThreshold
      },
      system: {
        maintenanceMode: formValues.maintenanceMode,
        dataRetention: formValues.dataRetention,
        backupFrequency: formValues.backupFrequency
      }
    };

    setTimeout(() => {
      localStorage.setItem('system_settings', JSON.stringify(this.systemSettings));
      this.saving = false;
      this.showNotification('Paramètres enregistrés avec succès', 'success');
    }, 1500);
  }

  resetToDefaults(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      this.systemSettings = {
        autoAssignment: {
          enabled: true,
          algorithm: 'distance_based',
          maxDistance: 25,
          maxDeliveriesPerDriver: 8,
          considerTraffic: true,
          considerDriverRating: true
        },
        notifications: {
          emailEnabled: true,
          pushEnabled: true,
          assignmentAlerts: true,
          deliveryUpdates: true,
          reportGeneration: true
        },
        performance: {
          deliveryTimeThreshold: 60,
          successRateThreshold: 85,
          ratingThreshold: 4.0
        },
        system: {
          maintenanceMode: false,
          dataRetention: 90,
          backupFrequency: 'daily'
        }
      };
      
      this.updateFormFromSettings();
      this.showNotification('Paramètres réinitialisés aux valeurs par défaut', 'info');
    }
  }

  // Nouvelle méthode pour obtenir le label de l'algorithme
  getAlgorithmLabel(algorithmValue: string): string {
    const algo = this.autoAssignmentAlgorithms.find(a => a.value === algorithmValue);
    return algo ? algo.label : algorithmValue;
  }

  getAlgorithmDescription(algoValue: string): string {
    const algo = this.autoAssignmentAlgorithms.find(a => a.value === algoValue);
    return algo ? algo.description : '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (type === 'success') {
      this.successMessage = message;
    } else if (type === 'error') {
      this.errorMessage = message;
    }

    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }
}