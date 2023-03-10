import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { IonicModule, NavController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { CommonService } from '../shared/common.service';
import { DbService } from '../shared/db.service';
import { EditarService } from '../shared/editar.service';
import { StorageService } from '../shared/storage.service';
import { Album } from '../types/album';
import { Registro } from '../types/registro';
import { TipoRegistro } from '../types/tipo-registro';

@Component({
  standalone: true,
  selector: 'app-lista-registro',
  templateUrl: './lista-registro.component.html',
  styleUrls: ['./lista-registro.component.scss'],
  imports: [CommonModule, IonicModule, AngularFireStorageModule],
})
export class ListaRegistroComponent implements OnInit {
  @Input() tipo: TipoRegistro;
  @Input() filtro = '';

  list: Registro<Album>[] = [];

  constructor(
    private db: DbService,
    private storage: StorageService,
    private common: CommonService,
    private router: NavController,
    private editarS: EditarService
  ) {}

  ngOnInit(): void {
    this.db.getRegistros(this.tipo).subscribe({
      next: (actions) => {
        this.list = actions.map((action) => {
          return {
            ...action.payload.val(),
            key: action.key,
          };
        });
      },
    });
  }

  getImagem(filePath: string) {
    return this.storage.downloadImage(filePath);
  }

  delete(registro: Registro<Album>) {
    this.common.showAlert('Atenção!', 'Deseja excluir?', () => {
      this.db.deleteRegistro(this.tipo, registro.key);
      if (registro.dados?.imagem) {
        this.deleteImage(registro);
      } else {
        this.db.deleteRegistro(this.tipo, registro.key);
      }
    });
  }

  private deleteImage(registro: Registro<Album>) {
    this.storage
      .delete(registro.dados.imagem)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.db.deleteRegistro(this.tipo, registro.key);
        },
      });
  }

  editar(registro: Registro<Album>): void {
    this.common.showAlert('Atenção!', 'Deseja editar?', () => {
    this.editarS.paraEditar = registro;
    this.editarS.tipoParaEditar = this.tipo;
    this.router.navigateForward(['tabs/tab3/e']);
    });}
}
