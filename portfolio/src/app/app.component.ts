import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WipComponent } from './components/wip/wip.component';
import { NavComponent } from './components/nav/nav.component';
import { LandingComponent } from './components/landing/landing.component';
import { AboutmeComponent } from './components/aboutme/aboutme.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,WipComponent,NavComponent, LandingComponent,AboutmeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'nap-portfolio';

  toggleDarkMode = ():void => {
    document.documentElement.classList.toggle('dark');
  };
  
}
