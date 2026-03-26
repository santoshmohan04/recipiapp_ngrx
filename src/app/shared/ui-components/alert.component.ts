import { Component, input, output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  title = input<string>('Alert');
  message = input<string>('');
  closeText = input<string>('Close');
  close = output<void>();
}
