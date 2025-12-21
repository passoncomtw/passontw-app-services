/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

/**
 * 類型聲明：react/jsx-runtime
 * 解決 TypeScript 找不到 react/jsx-runtime 類型定義的問題
 */
declare module 'react/jsx-runtime' {
  export namespace jsx {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  export function jsx(
    type: any,
    props: any,
    key?: string | number
  ): any;
  export function jsxs(
    type: any,
    props: any,
    key?: string | number
  ): any;
  export function Fragment(props: { children?: any }): any;
}