import jwt from "jsonwebtoken";

export interface DecodedToken {
  userId: number;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Função para verificar o token JWT
export const verifyToken = async (
  token: string
): Promise<DecodedToken | null> => {
  try {
    // Log para depuração
    console.log("[AUTH] Verificando token:", token.substring(0, 20) + "...");

    // Obter a chave secreta do ambiente
    const JWT_SECRET = process.env.JWT_SECRET || "secret_para_desenvolvimento";

    // Verificar o token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // Log para depuração após verificação bem-sucedida
    console.log("[AUTH] Token válido para usuário ID:", decoded.userId);

    return decoded;
  } catch (error: any) {
    // Log detalhado do erro para depuração
    console.error("[AUTH] Erro ao verificar token:", error.name, error.message);

    if (error.name === "TokenExpiredError") {
      console.error(
        "[AUTH] Token expirou em:",
        new Date((error as any).expiredAt)
      );
    }

    return null;
  }
};

// Função para gerar um novo token JWT
export const generateToken = (payload: Partial<DecodedToken>): string => {
  try {
    // Obter a chave secreta do ambiente
    const JWT_SECRET = process.env.JWT_SECRET || "secret_para_desenvolvimento";

    // Definir o tempo de expiração (24 horas)
    const expiresIn = 60 * 60 * 24;

    // Gerar o token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    // Log para depuração
    console.log("[AUTH] Novo token gerado para usuário ID:", payload.userId);
    console.log("[AUTH] Token começa com:", token.substring(0, 20) + "...");

    return token;
  } catch (error) {
    console.error("[AUTH] Erro ao gerar token:", error);
    throw error;
  }
};
