declare module 'encoding-japanese' {
  export function convert(data: any, options: any): any;
  export function detect(data: any): string;
  export function encode(data: any, options: any): any;
  export function decode(data: any, options: any): any;
  export function toSJIS(data: any): any;
  export function toUTF8(data: any): any;
}
