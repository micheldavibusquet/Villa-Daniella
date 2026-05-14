import { NextResponse } from "next/server";
import { adminClient } from "@/libs/sanity";

export async function POST(req: Request) {
  try {
    const { email, password, name, phone } = await req.json();

    // validação básica
    if (!email || !password || !name) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    // 🔍 verifica se já existe
    const existingUser = await adminClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (existingUser) {
      return new NextResponse("Usuário já existe", { status: 400 });
    }

    // 🧑 cria usuário
    const newUser = await adminClient.create({
      _type: "user",
      name,
      email,
      password,
      ...(phone ? { phone } : {}),
    });

    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return new NextResponse("Erro ao criar conta", { status: 500 });
  }
}