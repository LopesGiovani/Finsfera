declare module "bcrypt" {
  /**
   * Gera um salt para hash
   * @param rounds Número de rounds para o algoritmo bcrypt, padrão 10
   * @param callback Função de callback opcional
   */
  export function genSalt(
    rounds?: number,
    callback?: (err: Error, salt: string) => void
  ): Promise<string>;

  /**
   * Gera um hash da string fornecida
   * @param data Dados a serem hashados
   * @param saltOrRounds Pode ser um salt string ou número de rounds
   * @param callback Função de callback opcional
   */
  export function hash(
    data: string,
    saltOrRounds: string | number,
    callback?: (err: Error, encrypted: string) => void
  ): Promise<string>;

  /**
   * Compara a string fornecida com o hash
   * @param data Dados a serem comparados
   * @param encrypted Hash para comparação
   * @param callback Função de callback opcional
   */
  export function compare(
    data: string,
    encrypted: string,
    callback?: (err: Error, same: boolean) => void
  ): Promise<boolean>;

  /**
   * Obter número de rounds de um hash bcrypt
   * @param encrypted Hash para análise
   */
  export function getRounds(encrypted: string): number;
}
