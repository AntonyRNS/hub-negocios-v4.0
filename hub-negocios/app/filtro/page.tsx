'use client';

import { useEffect, useState } from 'react';
import { Search, MapPin, Clock, Briefcase, Mail } from 'lucide-react';

interface Profession {
  id: string;
  name: string;
}

interface Provider {
  id: string;
  full_name: string;
  email: string;
  profession_id: string;
  location: string;
  description: string;
  experience: string;
  age: number | null;
  service_hours: string;
  avatar_url: string;
  profession_name?: string; // Campo simplificado para usarmos direto no card
}

export default function Home() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = () => {
    setLoading(true);
    
    const savedProviders = localStorage.getItem('local_providers');
    const savedProfessions = localStorage.getItem('local_professions');
    
    const rawProviders: Provider[] = savedProviders ? JSON.parse(savedProviders) : [];
    const professionsList: Profession[] = savedProfessions ? JSON.parse(savedProfessions) : [];

    // Mapeia os dados injetando diretamente o nome da profissão no objeto do prestador
    const dataWithProfessions = rawProviders.map(provider => {
      const matchedProfession = professionsList.find(p => p.id === provider.profession_id);
      return {
        ...provider,
        profession_name: matchedProfession ? matchedProfession.name : 'Outra'
      };
    });

    setProviders(dataWithProfessions);
    setLoading(false);
  };

  const filteredProviders = providers.filter(p => 
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.profession_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-5" style={{ maxWidth: '1200px' }}>
      
      {/* Seção de Título */}
      <div className="text-center mb-5">
        <h1 className="fw-black text-uppercase mb-3 display-4" style={{ letterSpacing: '-1px' }}>
          Conectando Serviços Locais
        </h1>
        <p className="text-secondary mx-auto text-uppercase small fw-bold tracking-wider" style={{ maxWidth: '600px' }}>
          A plataforma minimalista para encontrar e divulgar profissionais na sua região.
        </p>
      </div>

      {/* Barra de Busca */}
      <div className="position-relative mx-auto mb-5" style={{ maxWidth: '650px' }}>
        <Search 
          size={18} 
          className="position-absolute text-muted" 
          style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}
        />
        <input 
          type="text"
          placeholder="BUSCAR POR NOME, PROFISSÃO OU LOCALIZAÇÃO..."
          className="form-control border-2 border-dark rounded-0 p-3 text-uppercase fw-bold shadow-none"
          style={{ paddingLeft: '48px', fontSize: '14px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Estado de Carregamento */}
      {loading ? (
        <div className="text-center py-5 text-muted text-uppercase fw-bold opacity-75">
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          Carregando prestadores...
        </div>
      ) : (
        <>
          {/* Contador de Resultados */}
          <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-dark pb-2">
            <h2 className="small fw-bold text-uppercase tracking-wider m-0">
              Resultados ({filteredProviders.length})
            </h2>
          </div>

          {/* Grid de Cards dos Prestadores */}
          {filteredProviders.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {filteredProviders.map(provider => (
                <div className="col" key={provider.id}>
                  
                  {/* CARD DE PRESTADOR (Substituindo o ProviderCard antigo) */}
                  <div className="card h-100 border-2 border-dark rounded-0 bg-white p-4 d-flex flex-column justify-content-between shadow-none">
                    <div>
                      {/* Topo do Card: Avatar e Nome */}
                      <div className="d-flex align-items-center mb-3">
                        <img 
                          src={provider.avatar_url || 'https://i.pravatar.cc/150'} 
                          alt={provider.full_name}
                          className="rounded-0 border border-dark me-3"
                          style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                        />
                        <div>
                          <span className="badge bg-dark rounded-0 text-uppercase fw-bold mb-1" style={{ fontSize: '10px' }}>
                            {provider.profession_name}
                          </span>
                          <h3 className="h6 text-uppercase fw-black m-0 tracking-tight">{provider.full_name}</h3>
                        </div>
                      </div>

                      {/* Descrição do serviço */}
                      <p className="text-secondary small mb-3" style={{ textAlign: 'justify' }}>
                        {provider.description || 'Nenhuma descrição fornecida.'}
                      </p>

                      {/* Informações detalhadas com ícones */}
                      <div className="border-top border-dark pt-3 mt-2">
                        <div className="d-flex align-items-center mb-2 small text-uppercase fw-bold text-muted">
                          <MapPin size={14} className="me-2 text-dark" />
                          <span>{provider.location}</span>
                        </div>
                        
                        {provider.experience && (
                          <div className="d-flex align-items-center mb-2 small text-uppercase fw-bold text-muted">
                            <Briefcase size={14} className="me-2 text-dark" />
                            <span>{provider.experience} de Exp.</span>
                          </div>
                        )}

                        {provider.service_hours && (
                          <div className="d-flex align-items-center mb-2 small text-uppercase fw-bold text-muted">
                            <Clock size={14} className="me-2 text-dark" />
                            <span>{provider.service_hours}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botão de Contato na base do card */}
                    <div className="mt-4">
                      <a 
                        href={`mailto:${provider.email}`}
                        className="btn btn-outline-dark rounded-0 w-100 py-2 text-uppercase fw-bold d-flex align-items-center justify-content-center"
                        style={{ fontSize: '12px', letterSpacing: '1px' }}
                      >
                        <Mail size={14} className="me-2" />
                        Contatar Profissional
                      </a>
                    </div>

                  </div>
                  {/* FIM DO CARD */}

                </div>
              ))}
            </div>
          ) : (
            /* Estado Vazio */
            <div className="text-center py-5 border border-2 border-dark border-dashed bg-white">
              <p className="text-muted text-uppercase fw-bold small tracking-wider m-0">
                Nenhum prestador encontrado para "{search}"
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}