import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WipComponent } from './components/wip/wip.component';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,WipComponent,NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'nap-portfolio';
}
