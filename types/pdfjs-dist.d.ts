// Tipagem mínima para o build ESM do pdfjs-dist usado no /check
declare module 'pdfjs-dist/build/pdf.mjs' {
  export const getDocument: any;
  export const GlobalWorkerOptions: { workerSrc: string };
}
