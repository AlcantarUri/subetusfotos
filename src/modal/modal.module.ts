import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ModalComponent } from "./modal.component";
import { LottieComponent } from "ngx-lottie";

@NgModule({
    declarations: [
        ModalComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        LottieComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
    ],
    exports: [
        ModalComponent
    ]
  })
  export class SharedModule { } 