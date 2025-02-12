
declare module 'mux.js' {
  export class Transmuxer {
    on(event: string, callback: (data: any) => void): void;
    push(data: Uint8Array): void;
    flush(): void;
  }
}