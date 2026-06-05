import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  /**
   * Show a success notification
   */
  showSuccess(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['success-snackbar'],
    });
  }

  /**
   * Show an error notification
   */
  showError(message: string, action: string = 'Dismiss'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration: 5000, // Errors stay longer
      panelClass: ['error-snackbar'],
    });
  }

  /**
   * Show an info notification
   */
  showInfo(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['info-snackbar'],
    });
  }

  /**
   * Show a warning notification
   */
  showWarning(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration: 4000,
      panelClass: ['warning-snackbar'],
    });
  }

  /**
   * Show a custom notification
   */
  show(message: string, action?: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      ...config,
    });
  }

  /**
   * Dismiss all notifications
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}
