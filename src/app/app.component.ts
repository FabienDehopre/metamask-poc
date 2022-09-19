import { AsyncPipe, JsonPipe, NgIf } from "@angular/common";
import {Component, inject, NgZone, OnInit} from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import {
  detectEthereumProvider,
  MetaMaskEthereumProvider,
} from "./detect-provider";
import { enterZone } from "./enter-zone";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [AsyncPipe, JsonPipe, NgIf],
  template: `
    <ng-container *ngIf="provider != undefined; else noProvider">
      <button (click)="connectToWallet()">Connect</button>
      <hr />
      <pre>Accounts: {{ accounts$ | async | json }}</pre>
    </ng-container>
    <ng-template #noProvider>
      <p>No ethereum provider found.</p>
    </ng-template>
  `,
})
export class AppComponent implements OnInit {
  provider?: MetaMaskEthereumProvider | null;
  accounts$?: Observable<string[]>;
  accountsSub = new ReplaySubject<string[]>(1);
  private readonly ngZone = inject(NgZone);

  async ngOnInit(): Promise<void> {
    this.accounts$ = this.accountsSub.asObservable().pipe(enterZone(this.ngZone));
    this.provider = await detectEthereumProvider();
    if (this.provider) {
      this.provider.on("accountsChanged", (accounts) => {
        this.accountsSub.next(accounts);
      });
    }
  }

  async connectToWallet(): Promise<void> {
    if (this.provider) {
      const result = (await this.provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      this.accountsSub.next(result);
    }
  }
}
