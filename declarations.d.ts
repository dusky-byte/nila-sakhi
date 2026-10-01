declare module 'react-dom' {
  export function useFormStatus(): {
    pending: boolean;
    data: FormData | null;
    method: string | null;
    action: ((formData: FormData) => void | Promise<void>) | null;
  };
  export function createPortal(children: any, container: any, key?: any): any;
  const content: any;
  export default content;
}

declare module 'three' {
  const content: any;
  export = content;
}
