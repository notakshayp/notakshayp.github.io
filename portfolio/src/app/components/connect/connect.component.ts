import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { faArrowUpRightFromSquare, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './connect.component.html',
  styleUrl: './connect.component.css'
})
export class ConnectComponent {

  faArrowUpRightFromSquare:IconDefinition=faArrowUpRightFromSquare;
}
