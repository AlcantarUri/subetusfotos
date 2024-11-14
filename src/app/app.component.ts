import { RouterOutlet } from '@angular/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, OnInit } from '@angular/core';
import { GoogleDriveService } from '../services/drive.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../modal/modal.module';
import { LottieComponent } from 'ngx-lottie';
import { provideAnimations } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule, SharedModule, LottieComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: provideAnimations(),
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class AppComponent {
  title = 'subetusfotos';
  photos: any[] = [];
  folderId = '1QvMXts6IwHxWhakVs8fxHAADkExRnXxV';
  selectedFiles: File[] = [];
  everageHeight = 200;
  isOpen: boolean = false;  // Controls whether the modal is open or not
  isModalOpen = false;

  modalVisible = true;
  constructor(
    private driveService: GoogleDriveService,
    private http: HttpClient) {}

  async ngOnInit() {
    if(localStorage.getItem('MODAL_VISIBLE') === 'false') {
      this.modalVisible = false;
    }
    if (!this.driveService.isSignedIn()) {
      await this.driveService.signIn();
    }
    this.loadPhotos();
  }

  async loadPhotos() {
    const response = await this.driveService.listFiles(this.folderId);
    console.log(response);

    this.photos = response.result.files;
  }

  async uploadPhoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      await this.driveService.uploadFile(file, this.folderId);
      this.loadPhotos(); // Refresh gallery
    }
  }

  signOut() {
    this.driveService.signOut();
  }

  singIn() {
    this.driveService.signIn();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);  // Almacena todos los archivos seleccionados
      this.modalVisible = false;  // Oculta el modal
      localStorage.setItem('MODAL_VISIBLE', 'false');  // Almacena el estado del modal
      this.uploadPhoto2()
    }
  }

  uploadPhoto2() {
    if (this.selectedFiles.length === 0) return;

    // Itera sobre los archivos seleccionados y los envía uno por uno
    for (const file of this.selectedFiles) {
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.http.post('http://lb-subetusfotosapi-1523404419.us-east-1.elb.amazonaws.com/upload', formData)
        .subscribe({
          next: (response) => console.log('Foto subida exitosamente:', response),
          error: (error) => console.error('Error al subir la foto:', error)
        });
    }

    this.loadPhotos();  // Refresca la galería
  }

  currentImage: any;
  openImage(photo: any) {
    this.currentImage = photo;
    console.log(photo);
    this.openModal()

  }

  openModal(): void {
    this.isModalOpen = true;
  }


  closeModal(): void {
    this.isModalOpen = false;
  }
}
