import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-wip',
  standalone: true,
  imports: [],
  templateUrl: './wip.component.html',
  styleUrl: './wip.component.css'
})
export class WipComponent {

  @Input() section_name:string="";
}
