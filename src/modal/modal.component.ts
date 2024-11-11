import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {

  @Output() onFileSelected: EventEmitter<Event> = new EventEmitter<Event>();
  @Output() dismissModal: EventEmitter<void> = new EventEmitter<void>();

  fileName: string | null = null;

  options: AnimationOptions = {
    path: '/assets/lottie/upload.json',
  };
}