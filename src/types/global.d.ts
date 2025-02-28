// Este arquivo contém declarações de módulos para pacotes sem tipos definidos
// ou para garantir compatibilidade em diferentes ambientes de build

// Se houver outros pacotes sem tipos que causem problemas no futuro,
// adicione suas declarações aqui

// Estas declarações só serão usadas se o TypeScript não encontrar
// os pacotes oficiais de tipos (@types/*)

declare module "pg" {
  export * from "pg-pool";
  export * from "pg-types";

  export interface Client {
    connect(): Promise<void>;
    query(queryText: string, values?: any[]): Promise<any>;
    end(): Promise<void>;
  }
}

declare module "pg-hstore" {
  function stringify(data: any): string;
  function parse(data: string): any;

  export = {
    stringify,
    parse,
  };
}
