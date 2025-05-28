// src/app/components/result-list/result-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ResultService } from 'src/app/services/historique/historique.service';
import { ResultDTO } from 'src/app/models/ResultDTO';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})
export class HistoriqueComponent {
  displayedColumns: string[] = ['place', 'namePrenom', 'nation', 'club', 'temps', 'points', 'eventName', 'categoryName'];
  dataSource = new MatTableDataSource<ResultDTO>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private resultService: ResultService) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.resultService.getAllResults().subscribe(results => {
      this.dataSource.data = results;
      this.dataSource.paginator = this.paginator;
    });
  }
}
