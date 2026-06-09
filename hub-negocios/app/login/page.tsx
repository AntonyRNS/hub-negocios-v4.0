'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Padrão App Router que o projeto já usa [3]

// Usuários padrão que serão salvos no navegador
const DEFAULT_USERS = [
  { id: '1', email: 'Gabriel@gmail.com', password: '123456789', name: 'Gabriel' },
  { id: '2', email: 'Antony@gmail.com', password: '123456789', name: 'Antony' },
  { id: '3', email: 'padrao@gmail.com', password: '123456789', name: 'Usuário Padrão' }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Salva os usuários no LocalStorage se eles ainda não existirem [1]
  useEffect(() => {
    const savedUsers = localStorage.getItem('local_users');
    if (!savedUsers) {
      localStorage.setItem('local_users', JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Para o recarregamento automático da página
    setError('');

    // RECUPERA OS USUÁRIOS (ESSA PARTE FALTA NO SEU CÓDIGO ATUAL)
    const savedUsers = localStorage.getItem('local_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    // PROCURA O USUÁRIO (ESSA PARTE TAMBÉM FALTA)
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      // SALVA A SESSÃO E MUDA DE PÁGINA
      localStorage.setItem('is_logged_in', 'true');
      localStorage.setItem('current_user', JSON.stringify(user));
      
      console.log('Login realizado com sucesso!');
      router.push('/'); // ISSO FAZ VOCÊ SAIR DA TELA DE LOGIN
    } else {
      setError('E-mail ou senha incorretos.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div style={{ marginBottom: '10px' }}>
          <label>E-mail:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Senha:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}