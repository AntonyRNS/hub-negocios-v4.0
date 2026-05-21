'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap } from 'lucide-react';

interface Profession {
  id: string;
  name: string;
}

const DEFAULT_PROFESSIONS: Profession[] = [
  { id: 'prof-1', name: 'Carpinteiro' },
  { id: 'prof-2', name: 'Desenvolvedor Fullstack' },
  { id: 'prof-3', name: 'Eletricista' },
  { id: 'prof-4', name: 'Encanador' },
  { id: 'prof-5', name: 'Pintor' },
];

export default function CadastrarPage() {
  const router = useRouter();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isNewProfession, setIsNewProfession] = useState(false);
  const [customProfession, setCustomProfession] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    profession_id: '',
    location: '',
    description: '',
    experience: '',
    age: '',
    service_hours: '',
    avatar_url: ''
  });

  useEffect(() => {
    fetchProfessions();
  }, []);

  const fetchProfessions = async () => {
    try {
      const response = await fetch('/api/professions');
      if (response.ok) {
        const data = await response.json();
        setProfessions(data);
      } else {
        console.error('Erro ao carregar profissões da API');
      }
    } catch (error) {
      console.error('Erro ao carregar profissões:', error);
    }
  };

  const handleQuickFill = () => {
    setIsNewProfession(false);
    setFormData({
      full_name: 'João da Silva (TESTE BANCO)',
      email: 'joao.teste@email.com',
      profession_id: professions[0]?.id || '',
      location: 'São Paulo, SP',
      description: 'Prestador de serviços com vasta experiência em manutenção residencial e pequenos reparos salvos no Supabase.',
      experience: '10 anos',
      age: '35',
      service_hours: 'Seg-Sex: 08:00 - 18:00',
      avatar_url: 'https://i.pravatar.cc/150?u=joao'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isNewProfession && !formData.profession_id) {
      alert('Por favor, selecione ou informe uma profissão.');
      setLoading(false);
      return;
    }

    if (isNewProfession && !customProfession.trim()) {
      alert('Por favor, digite o nome da profissão customizada.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isNewProfession,
          customProfession: isNewProfession ? customProfession.trim() : undefined,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/filtro'), 2000);
      } else {
        const errData = await response.json();
        alert(errData.error || 'Erro ao salvar prestador.');
      }
    } catch (err) {
      console.error('Erro ao salvar prestador:', err);
      alert('Erro de conexão ao salvar os dados.');
    } finally {
      setLoading(false);
    }
  };

  // Tela de Sucesso em Bootstrap
  if (success) {
    return (
      <div className="container text-center py-5" style={{ maxWidth: '1200px' }}>
        <div 
          className="d-inline-flex align-items-center justify-content-center bg-dark text-white mb-4" 
          style={{ width: '64px', height: '64px' }}
        >
          <Check size={32} />
        </div>
        <h1 className="fw-black text-uppercase tracking-tight mb-2 h3">CADASTRO REALIZADO!</h1>
        <p className="text-secondary text-uppercase small fw-bold tracking-wider">Redirecionando para a home...</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '768px' }}>
      
      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-end mb-5 border-bottom border-4 border-dark pb-3">
        <div>
          <h1 className="fw-bold text-uppercase m-0 display-6" style={{ letterSpacing: '-1px' }}>Lançar Serviço</h1>
          <p className="text-secondary text-uppercase small fw-bold tracking-wider m-0 mt-1">
            Divulgue seu trabalho em poucos passos (Modo Local)
          </p>
        </div>
        <button 
          type="button"
          onClick={handleQuickFill}
          className="btn btn-light rounded-0 border border-dark text-uppercase small fw-bold py-2 px-3 d-flex align-items-center"
          style={{ fontSize: '12px' }}
        >
          <Zap size={14} className="me-2" />
          Preenchimento Rápido
        </button>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <div className="row g-4 mb-4">
          
          {/* Nome */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-uppercase tracking-wider">Nome Completo *</label>
            <input 
              required
              className="form-control border-2 border-dark rounded-0 shadow-none p-3 text-uppercase fw-bold"
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          
          {/* Email */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-uppercase tracking-wider">E-mail *</label>
            <input 
              required
              type="email"
              className="form-control border-2 border-dark rounded-0 shadow-none p-3 fw-bold"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Profissão */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-uppercase tracking-wider">Profissão *</label>
            <div>
              {!isNewProfession ? (
                <select 
                  required={!isNewProfession}
                  className="form-select border-2 border-dark rounded-0 shadow-none p-3 fw-bold"
                  value={formData.profession_id}
                  onChange={e => {
                    if (e.target.value === 'NEW') {
                      setIsNewProfession(true);
                    } else {
                      setFormData({...formData, profession_id: e.target.value});
                    }
                  }}
                >
                  <option value="">Selecione uma profissão</option>
                  {professions.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="NEW">+ OUTRA (ESPECIFICAR...)</option>
                </select>
              ) : (
                <div className="d-flex gap-2">
                  <input 
                    required
                    placeholder="Digite o nome da profissão"
                    className="form-control border-2 border-dark rounded-0 shadow-none p-3 fw-bold"
                    value={customProfession}
                    onChange={e => setCustomProfession(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setIsNewProfession(false);
                      setCustomProfession('');
                    }}
                    className="btn btn-outline-dark rounded-0 border-2 px-3 text-uppercase small fw-bold"
                    style={{ fontSize: '10px' }}
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Localização */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-uppercase tracking-wider">Localização *</label>
            <input 
              required
              placeholder="Ex: São Paulo, SP"
              className="form-control border-2 border-dark rounded-0 shadow-none p-3 text-uppercase fw-bold"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          {/* Experiência */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-uppercase tracking-wider">Experiência</label>
            <input 
              placeholder="Ex: 5 anos"
              className="form-control border-2 border-dark rounded-0 shadow-none p-3 text-uppercase fw-bold"
              value={formData.experience}
              onChange={e => setFormData({...formData, experience: e.target.value})}
            />
          </div>

          {/* Idade */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-uppercase tracking-wider">Idade</label>
            <input 
              type="number"
              className="form-control border-2 border-dark rounded-0 shadow-none p-3 fw-bold"
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
            />
          </div>
        </div>

        {/* Horário */}
        <div className="mb-4">
          <label className="form-label small fw-bold text-uppercase tracking-wider">Horário de Atendimento</label>
          <input 
            placeholder="Ex: Seg-Sex 08:00 - 18:00"
            className="form-control border-2 border-dark rounded-0 shadow-none p-3 text-uppercase fw-bold"
            value={formData.service_hours}
            onChange={e => setFormData({...formData, service_hours: e.target.value})}
          />
        </div>

        {/* Descrição */}
        <div className="mb-5">
          <label className="form-label small fw-bold text-uppercase tracking-wider">Descrição do Serviço</label>
          <textarea 
            rows={4}
            className="form-control border-2 border-dark rounded-0 shadow-none p-3 fw-bold"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        {/* Botão de Envio com Spinner nativo do Bootstrap */}
        <button 
          disabled={loading}
          type="submit"
          className="btn btn-dark rounded-0 w-100 py-3 text-uppercase fw-bold tracking-widest d-flex align-items-center justify-content-center"
          style={{ letterSpacing: '1px' }}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            'PUBLICAR SERVIÇO'
          )}
        </button>
      </form>
    </div>
  );
}