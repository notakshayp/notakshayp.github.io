import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { faEnvelope,faFeatherPointed, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { faLinkedin } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './connect.component.html',
  styleUrl: './connect.component.css'
})
export class ConnectComponent {

  faEnvelope:IconDefinition=faEnvelope;
  faLinkedin:IconDefinition=faLinkedin;
}
