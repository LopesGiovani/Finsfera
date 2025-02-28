import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";

// Chave secreta para assinar os tokens JWT (deve ser substituída por uma variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_muito_segura";

// Interface para o payload do token JWT
interface JwtPayload {
  id: number;
  email: string;
}

// Função para autenticar um usuário
export const authenticateUser = async (email: string, password: string) => {
  try {
    // Busca o usuário pelo email
    const user = await User.findOne({ where: { email } });

    // Verifica se o usuário existe
    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    // Verifica se a senha está correta
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return { success: false, message: "Senha incorreta" };
    }

    // Cria o token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email } as JwtPayload,
      JWT_SECRET,
      { expiresIn: "1d" } // Token expira em 1 dia
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Erro durante autenticação:", error);
    return { success: false, message: "Erro durante autenticação" };
  }
};

// Middleware para verificar se o usuário está autenticado
export const isAuthenticated = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) => {
  try {
    // Pega o token do cabeçalho ou dos cookies
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    // Verifica se o token existe
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token não fornecido" });
    }

    // Verifica se o token é válido
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Busca o usuário no banco
    const user = await User.findByPk(decoded.id);

    // Verifica se o usuário existe
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não encontrado" });
    }

    // Adiciona o usuário ao request para uso posterior
    (req as any).user = user;

    // Passa para o próximo middleware
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
};

// Função para gerar um novo token
export const refreshToken = (userId: number, email: string) => {
  return jwt.sign({ id: userId, email } as JwtPayload, JWT_SECRET, {
    expiresIn: "1d",
  });
};
