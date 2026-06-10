'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  const isMobile = digits.length === 11;
  const splitPos = isMobile ? 7 : 6;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, splitPos)}-${digits.slice(splitPos)}`;
}

function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("Brasileira");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
        setLoading(true);

    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`,
          phone: phone.trim(),
          email,
          password,
          cpf: cpf.trim(),
          rg: rg.trim(),
          birthDate,
          nationality,
          address: {
            cep: cep.trim(),
            street: street.trim(),
            number: houseNumber.trim(),
            complement: complement.trim(),
            city: city.trim(),
            state: state.trim(),
          },
          emergencyContact: emergencyContact.trim(),
          emergencyPhone: emergencyPhone.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        router.push('/');
      } else {
        setError(data.error || 'Erro ao criar conta');
      }
    } finally {
      setLoading(false);
    }

  }

  const inputClass =

    "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#46220f] placeholder-gray-400 dark:placeholder-gray-500 text-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1";
  const sectionClass = "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Criar conta</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Preencha todos os dados para se cadastrar</p>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-5">

          {/* DADOS PESSOAIS */}
          <div className={sectionClass}>
            <h2 className="text-sm font-bold text-[#46220f] dark:text-amber-400 uppercase tracking-widest mb-4">Dados Pessoais</h2>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="firstName" className={labelClass}>Nome *</label>
                <input id="firstName" type="text" placeholder="Nome" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClass}>Sobrenome *</label>
                <input id="lastName" type="text" placeholder="Sobrenome" value={lastName}
                  onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="cpf" className={labelClass}>CPF *</label>
                <input id="cpf" type="text" placeholder="000.000.000-00" value={cpf}
                  onChange={(e) => setCpf(maskCPF(e.target.value))} required maxLength={14} className={inputClass} />
              </div>
              <div>
                <label htmlFor="rg" className={labelClass}>RG *</label>
                <input id="rg" type="text" placeholder="Ex: 1234567" value={rg}
                  onChange={(e) => setRg(e.target.value)} required maxLength={20} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="birthDate" className={labelClass}>Data de Nascimento *</label>
                <input id="birthDate" type="date" value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="nationality" className={labelClass}>Nacionalidade *</label>
                <input id="nationality" type="text" placeholder="Ex: Brasileira" value={nationality}
                  onChange={(e) => setNationality(e.target.value)} required className={inputClass} />
              </div>
            </div>
          </div>

          {/* CONTATO */}
          <div className={sectionClass}>
            <h2 className="text-sm font-bold text-[#46220f] dark:text-amber-400 uppercase tracking-widest mb-4">Contato</h2>

            <div className="mb-3">
              <label htmlFor="phone" className={labelClass}>Telefone / WhatsApp *</label>
              <input id="phone" type="tel" placeholder="(48) 99999-9999" value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))} required maxLength={15} className={inputClass} />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>E-mail *</label>
              <input id="email" type="email" placeholder="seu@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            </div>
          </div>

          {/* ENDEREÇO */}
          <div className={sectionClass}>
            <h2 className="text-sm font-bold text-[#46220f] dark:text-amber-400 uppercase tracking-widest mb-4">Endereço</h2>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="cep" className={labelClass}>CEP *</label>
                <input id="cep" type="text" placeholder="00000-000" value={cep}
                  onChange={(e) => setCep(maskCEP(e.target.value))} required maxLength={9} className={inputClass} />
              </div>
              <div>
                <label htmlFor="houseNumber" className={labelClass}>Número *</label>
                <input id="houseNumber" type="text" placeholder="Ex: 42" value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)} required className={inputClass} />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="street" className={labelClass}>Rua / Logradouro *</label>
              <input id="street" type="text" placeholder="Ex: Rua das Flores" value={street}
                onChange={(e) => setStreet(e.target.value)} required className={inputClass} />
            </div>

            <div className="mb-3">
              <label htmlFor="complement" className={labelClass}>Complemento</label>
              <input id="complement" type="text" placeholder="Apto, Bloco, etc. (opcional)" value={complement}
                onChange={(e) => setComplement(e.target.value)} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className={labelClass}>Cidade *</label>
                <input id="city" type="text" placeholder="Ex: Florianópolis" value={city}
                  onChange={(e) => setCity(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="uf" className={labelClass}>Estado (UF) *</label>
                <input id="uf" type="text" placeholder="Ex: SC" value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} required maxLength={2} className={inputClass} />
              </div>
            </div>
          </div>

          {/* CONTATO DE EMERGÊNCIA */}
          <div className={sectionClass}>
            <h2 className="text-sm font-bold text-[#46220f] dark:text-amber-400 uppercase tracking-widest mb-4">Contato de Emergência</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="emergencyContact" className={labelClass}>Nome do Contato *</label>
                <input id="emergencyContact" type="text" placeholder="Nome completo" value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="emergencyPhone" className={labelClass}>Telefone *</label>
                <input id="emergencyPhone" type="tel" placeholder="(48) 99999-9999" value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(maskPhone(e.target.value))} required maxLength={15} className={inputClass} />
              </div>
            </div>
          </div>

          {/* ACESSO */}
          <div className={sectionClass}>
            <h2 className="text-sm font-bold text-[#46220f] dark:text-amber-400 uppercase tracking-widest mb-4">Acesso</h2>

            <div className="mb-3">
              <label htmlFor="password" className={labelClass}>Senha * (mínimo 6 caracteres)</label>
              <input id="password" type="password" placeholder="Crie uma senha segura" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirmar Senha *</label>
              <input id="confirmPassword" type="password" placeholder="Repita a senha" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className={inputClass} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#46220f] text-white py-3 rounded-xl hover:bg-[#5a2e16] transition-colors font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Já tem uma conta?{' '}
            <a href="/auth/signin" className="text-[#46220f] dark:text-amber-400 font-semibold hover:underline">Entrar</a>
          </p>
        </form>
      </div>
    </div>
  );
}
