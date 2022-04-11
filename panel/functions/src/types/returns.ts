export interface ReturnStruct {
  error?: ErrorObject;
  [key: string]: unknown;
}

export type ErrorObject = {
  code: string;
  description: string;
};
