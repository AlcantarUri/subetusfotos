import { RouterOutlet } from '@angular/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, OnInit } from '@angular/core';
import { GoogleDriveService } from '../services/drive.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../modal/modal.module';
import { LottieComponent } from 'ngx-lottie';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp } from 'firebase/app';
import { getStorage } from "firebase/storage";
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore/lite";
import { AnonymousSubject } from 'rxjs/internal/Subject';
import * as lodash from 'lodash';
import { DATA_FAKE } from '../typings/data';


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
  photos: any[] = DATA_FAKE
  folderId = '1QvMXts6IwHxWhakVs8fxHAADkExRnXxV';
  selectedFiles: File[] = [];
  everageHeight = 200;
  isOpen: boolean = false;  // Controls whether the modal is open or not
  isModalOpen = false;
  isProcessing = false;

  modalVisible = true;
  firebaseConfig = {
    apiKey: "AIzaSyBQ_9rYAbla-2PR7gKmp7G9xwt3oJv5m54",
    authDomain: "subetusfotos-22490.firebaseapp.com",
    projectId: "subetusfotos-22490",
    storageBucket: "subetusfotos-22490.firebasestorage.app",
    messagingSenderId: "169574660148",
    appId: "1:169574660148:web:ec8459bc35ef4f270c7261",
    measurementId: "G-SY4WLLJR8L"
  };

  isLoading = true

  db: any;
  likesCollection: any;
  constructor(
    private driveService: GoogleDriveService,
    private http: HttpClient) {}

    sumLikes: any;

  async ngOnInit() {
    if(localStorage.getItem('MODAL_VISIBLE') === 'false') {
      this.modalVisible = false;
    }
    if (!this.driveService.isSignedIn()) {
      await this.driveService.signIn();
    }
    this.loadPhotos();
    const app = initializeApp(this.firebaseConfig);
    this.db = getFirestore(app);
    this.sumLikes = this.groupAndSumLikes(await this.getLikes())


  }

  async loadPhotos() {
    this.isLoading = true;
    const response = await this.driveService.listFiles(this.folderId);
    this.photos = [];
    // console.log(response);

    // this.photos = response.result.files;
    // console.log(this.photos);
    this.photos = this.mergeDataById(response.result.files, this.sumLikes);

    this.isLoading = false;
    console.log(this.photos);


  }

  async uploadPhoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      await this.driveService.uploadFile(file, this.folderId);
      this.loadPhotos(); // Refresh gallery
    }
  }

  groupAndSumLikes(items: any) {
    // Agrupar los elementos por ID
    const grouped = lodash.groupBy(items, 'photoId');
    console.log(grouped);


    // Transformar los grupos en un nuevo arreglo sumando los likes
    return lodash.map(grouped, (group, photoId) => {
      return {
        id: photoId,
        totalLikes: group.length // Suma los valores de likes
      };
    });
  }

  mergeDataById(
    array1: any,
    array2: any
  ) {
    // Crear un mapa del segundo arreglo para acceder rápidamente por ID
    const mapArray2 = lodash.keyBy(array2, 'id');

    // Iterar sobre el primer arreglo y agregar los datos del segundo cuando coincidan
    return lodash.map(array1, (item) => {
      const extraData = mapArray2[item.id]; // Busca el objeto con el mismo ID en array2
      return extraData ? { ...item, ...extraData } : item; // Combina los objetos si hay coincidencia
    });
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
    this.isProcessing = true;

    // Itera sobre los archivos seleccionados y los envía uno por uno
    for (const file of this.selectedFiles) {
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.http.post('https://subetusfotosapi.click/upload', formData)
        .subscribe({
          next: (response) => {
            setTimeout(() => {
              this.isProcessing = false;
              this.loadPhotos();
              
            }, 5000);
            console.log('Foto subida exitosamente:', response)
          },
          error: (error) => {
            console.error('Error al subir la foto:', error)
            this.isProcessing = false;
          }
        });
    }
  // Refresca la galería
  }

  currentImage: any;
  openImage(photo: any) {
    this.currentImage = photo;
    this.openModal()
  }

  openModal(): void {
    this.isModalOpen = true;
  }


  async closeModal() {
    this.isModalOpen = false;
    this.photos = this.mergeDataById(this.photos, this.groupAndSumLikes(await this.getLikes()));
  }


  async getLikes() {
    this.likesCollection = collection(this.db, 'likedPhotos');
    const likesSnapshot = await getDocs(this.likesCollection);
    const likesList = likesSnapshot.docs.map(doc => doc.data());
    return likesList;
  }

  async addLikeData(photo: any) {
    try {
      const docRef = await addDoc(this.likesCollection, {
        likesCount: "1",
        photoId: photo.id,
        timestamp: new Date() // Timestamp actual
      });
      console.log("Documento agregado con ID: ", docRef.id);
    } catch (error) {
      console.error("Error al agregar documento: ", error);
    }
  }

  isLiked: boolean = false;
  likeCount: number = 0;

  async toggleLike(currentImage:any) {
    console.log('toggleLike', currentImage);
    try {
      const docRef = await addDoc(this.likesCollection, {
        likesCount: "1",
        photoId: currentImage.id,
        timestamp: new Date() // Timestamp actual
      });
      console.log("Documento agregado con ID: ", docRef.id);
    } catch (error) {
      console.error("Error al agregar documento: ", error);
    }
    this.likeCount += 1;
  }

}
