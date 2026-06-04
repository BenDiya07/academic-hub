import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';
import { Topbar } from '../topbar/topbar';


@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Topbar, FooterComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {}
