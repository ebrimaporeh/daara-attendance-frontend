/// <reference types="vite/client" />


declare module '*.css';

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.sass' {
  const content: string;
  export default content;
}

declare module '*.less' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

declare module '*.png' {
  export const content: string;
}

declare module '*.jpg' {
  export const content: string;
}

declare module '*.jpeg' {
  export const content: string;
}

declare module '*.gif' {
  export const content: string;
}