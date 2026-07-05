import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  password: z.string().min(1, "Senha é obrigatória"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = loginSchema.parse(body);

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD não configurada no .env");
      return NextResponse.json(
        { success: false, error: "Erro de configuração do servidor" },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: "Senha inválida" },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: "admin",
      email: "admin@pagflow.com",
      role: "admin",
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: "admin",
        name: "Administrador",
        email: "admin@pagflow.com",
        role: "admin",
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Erro ao fazer login:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
