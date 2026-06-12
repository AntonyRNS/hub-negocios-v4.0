'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Mantendo o roteador do App Router [1, 2]
import Link from 'next/link'; // Componente padrão para navegação [3]

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

  // Mantém a inicialização (seed) no LocalStorage [3, 4]
  useEffect(() => {
    const savedUsers = localStorage.getItem('local_users');
    if (!savedUsers) {
      localStorage.setItem('local_users', JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mantém a busca direta no LocalStorage conforme o padrão do projeto [4, 5]
    const savedUsers = localStorage.getItem('local_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('is_logged_in', 'true');
      localStorage.setItem('current_user', JSON.stringify(user));
      
      console.log('Login realizado com sucesso!');
      router.push('/'); // Redireciona para a home [1]
    } else {
      setError('E-mail ou senha incorretos.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div>
          <label>E-mail:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Senha:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button type="submit">Entrar</button>
          
          {/* Link para a página externa de recuperação conforme solicitado */}
          <Link 
            href="/recuperar-senha" 
            style={{ fontSize: '14px', color: 'blue', textDecoration: 'underline' }}
          >
            Esqueci minha senha
          </Link>
        </div>
      </form>
    </div>
  );
}