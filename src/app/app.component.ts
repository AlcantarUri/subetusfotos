import { RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { GoogleDriveService } from '../services/drive.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'subetusfotos';
  photos: any[] = [];
  folderId = '1QvMXts6IwHxWhakVs8fxHAADkExRnXxV';

  constructor(private driveService: GoogleDriveService) {}

  async ngOnInit() {
    if (!this.driveService.isSignedIn()) {
      await this.driveService.signIn();
    }
    this.loadPhotos();
  }

  async loadPhotos() {
    const response = await this.driveService.listFiles(this.folderId);
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
  
}
